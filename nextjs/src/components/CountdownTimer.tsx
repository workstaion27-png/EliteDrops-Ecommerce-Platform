'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  endDate: Date
  title?: string
  showTitle?: boolean
  className?: string
}

export default function CountdownTimer({ 
  endDate, 
  title = "Limited Time Offer", 
  showTitle = true,
  className = ""
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const endTime = new Date(endDate).getTime()
      const difference = endTime - now

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false
      })
    }

    // Calculate immediately
    calculateTimeLeft()

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  if (timeLeft.isExpired) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-red-800">
          <Clock className="h-5 w-5" />
          <span className="font-medium">Offer has expired</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 ${className}`}>
      {showTitle && (
        <div className="flex items-center gap-2 text-red-800 mb-3">
          <Clock className="h-5 w-5" />
          <span className="font-bold text-lg">{title}</span>
        </div>
      )}
      
      <div className="flex items-center justify-center gap-2">
        <TimeUnit value={timeLeft.days} unit="Days" />
        <span className="text-red-800 font-bold text-xl">:</span>
        <TimeUnit value={timeLeft.hours} unit="Hours" />
        <span className="text-red-800 font-bold text-xl">:</span>
        <TimeUnit value={timeLeft.minutes} unit="Minutes" />
        <span className="text-red-800 font-bold text-xl">:</span>
        <TimeUnit value={timeLeft.seconds} unit="Seconds" />
      </div>
      
      <div className="text-center mt-2">
        <span className="text-sm text-red-700 font-medium">
          Hurry! Only {timeLeft.days > 0 && `${timeLeft.days} day${timeLeft.days > 1 ? 's' : ''}, `}
          {timeLeft.hours} hour{timeLeft.hours !== 1 ? 's' : ''}, {timeLeft.minutes} minute{timeLeft.minutes !== 1 ? 's' : ''} left
        </span>
      </div>
    </div>
  )
}

function TimeUnit({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-red-800 text-white rounded-lg px-3 py-2 min-w-[50px]">
        <div className="text-xl font-bold">{value.toString().padStart(2, '0')}</div>
      </div>
      <div className="text-xs text-red-700 font-medium mt-1">{unit}</div>
    </div>
  )
}