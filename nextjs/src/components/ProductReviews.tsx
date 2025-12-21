'use client'

import { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown, X, Send } from 'lucide-react'

interface Review {
  id: string
  customerName: string
  rating: number
  comment: string
  date: string
  verified: boolean
  helpful: number
}

interface ProductReviewsProps {
  productId: string
  reviews: Review[]
  averageRating: number
  totalReviews: number
  onNewReview?: (review: Omit<Review, 'id' | 'date' | 'helpful'>) => void
}

export default function ProductReviews({ productId, reviews, averageRating, totalReviews, onNewReview }: ProductReviewsProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest')
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({})
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    customerName: '',
    rating: 5,
    comment: ''
  })

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case 'highest':
        return b.rating - a.rating
      case 'lowest':
        return a.rating - b.rating
      case 'helpful':
        return b.helpful - a.helpful
      default:
        return 0
    }
  })

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const markHelpful = (reviewId: string) => {
    if (helpfulVotes[reviewId]) return
    
    setHelpfulVotes(prev => ({ ...prev, [reviewId]: true }))
    // Here you would update the helpful count in your backend
  }

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!reviewForm.customerName.trim() || !reviewForm.comment.trim()) {
      alert('Please fill in all fields')
      return
    }

    // Create new review
    const newReview = {
      customerName: reviewForm.customerName.trim(),
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
      verified: true
    }

    // Call parent callback if provided
    if (onNewReview) {
      onNewReview(newReview)
    }

    // Reset form and close modal
    setReviewForm({ customerName: '', rating: 5, comment: '' })
    setShowReviewModal(false)
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const ratingDistribution = getRatingDistribution()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
        <div className="text-sm text-gray-500">
          {totalReviews} review{totalReviews !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Rating Summary */}
      <div className="flex items-center gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
          {renderStars(averageRating, 'lg')}
          <div className="text-sm text-gray-600 mt-1">out of 5</div>
        </div>
        
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-600 w-8">{rating}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${totalReviews > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / totalReviews) * 100 : 0}%`
                  }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">
                {ratingDistribution[rating as keyof typeof ratingDistribution]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
        >
          <option value="newest">Newest first</option>
          <option value="highest">Highest rating</option>
          <option value="lowest">Lowest rating</option>
          <option value="helpful">Most helpful</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{review.customerName}</span>
                  {review.verified && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => markHelpful(review.id)}
                disabled={helpfulVotes[review.id]}
                className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full transition-colors ${
                  helpfulVotes[review.id]
                    ? 'bg-green-100 text-green-800 cursor-default'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                Helpful ({review.helpful})
              </button>
              
              <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
                <ThumbsDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Write Review Button */}
      <div className="mt-8 text-center">
        <button 
          onClick={() => setShowReviewModal(true)}
          className="px-6 py-3 bg-luxury-gold text-white font-medium rounded-lg hover:bg-luxury-dark-gold transition-colors"
        >
          Write a Review
        </button>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={reviewForm.customerName}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {reviewForm.rating} out of 5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  placeholder="Share your thoughts about this product..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-luxury-gold text-white font-medium rounded-lg hover:bg-luxury-dark-gold transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}