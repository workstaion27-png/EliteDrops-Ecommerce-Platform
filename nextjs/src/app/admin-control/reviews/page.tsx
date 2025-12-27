'use client';

import { useState, useEffect } from 'react';
import { Star, Check, X, Flag, AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react';

interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  order_id: string;
  rating: number;
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  images: string[];
  status: string;
  customer_name: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  products?: {
    id: string;
    name: string;
    slug: string;
    thumbnail_url: string;
  };
}

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    average_rating: 0,
    this_month: 0
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews?status=${filter === 'all' ? undefined : filter}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/reviews?action=stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', review_id: reviewId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchReviews();
        fetchStats();
        setSelectedReview(null);
      }
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedReview || !rejectReason.trim()) return;
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reject', 
          review_id: selectedReview.id,
          reason: rejectReason 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchReviews();
        fetchStats();
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedReview(null);
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-${size/4} h-${size/4}`}
            size={size}
            fill={star <= rating ? '#fbbf24' : 'none'}
            stroke={star <= rating ? '#fbbf24' : '#d1d5db'}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">إدارة المراجعات</h1>
                <p className="text-sm text-slate-500">مراجعة وتقييم المراجعات</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-slate-500">إجمالي المراجعات</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 shadow-sm border border-yellow-200">
            <p className="text-sm text-yellow-700">قيد الانتظار</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
            <p className="text-sm text-green-700">مقبولة</p>
            <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 shadow-sm border border-red-200">
            <p className="text-sm text-red-700">مرفوضة</p>
            <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
            <p className="text-sm text-blue-700">متوسط التقييم</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-blue-700">{stats.average_rating}</p>
              <Star className="w-5 h-5 text-yellow-500" fill="#fbbf24" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-slate-200">
            <div className="flex gap-4 px-4">
              {[
                { key: 'pending', label: 'قيد الانتظار', icon: Clock, color: 'yellow' },
                { key: 'approved', label: 'مقبولة', icon: CheckCircle, color: 'green' },
                { key: 'rejected', label: 'مرفوضة', icon: X, color: 'red' },
                { key: 'all', label: 'الكل', icon: MessageSquare, color: 'blue' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    filter === tab.key
                      ? `border-${tab.color}-600 text-${tab.color}-600`
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">لا توجد مراجعات</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedReview(review)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {review.products?.thumbnail_url && (
                          <img
                            src={review.products.thumbnail_url}
                            alt={review.products.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">
                              {review.products?.name || 'منتج محذوف'}
                            </h3>
                            {review.verified_purchase && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                ✓ شراء موثق
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            {renderStars(review.rating, 14)}
                            <span className="text-sm text-slate-500">
                              بواسطة {review.customer_name || 'عميل'}
                            </span>
                          </div>
                          {review.title && (
                            <h4 className="font-medium text-slate-800 mb-1">{review.title}</h4>
                          )}
                          <p className="text-slate-600 text-sm line-clamp-2">{review.comment}</p>
                          {review.pros?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {review.pros.map((pro, i) => (
                                <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                                  + {pro}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-left">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          review.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          review.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {review.status === 'pending' ? 'قيد الانتظار' :
                           review.status === 'approved' ? 'مقبولة' : 'مرفوضة'}
                        </span>
                        <p className="text-xs text-slate-500 mt-2">{formatDate(review.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">تفاصيل المراجعة</h2>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Product Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                {selectedReview.products?.thumbnail_url && (
                  <img
                    src={selectedReview.products.thumbnail_url}
                    alt={selectedReview.products.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-slate-900">{selectedReview.products?.name}</h3>
                  <p className="text-sm text-slate-500">بواسطة {selectedReview.customer_name || 'عميل'}</p>
                </div>
              </div>

              {/* Rating & Status */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {renderStars(selectedReview.rating, 24)}
                  <span className="text-lg font-semibold text-slate-900">{selectedReview.rating}/5</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedReview.verified_purchase && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      ✓ شراء موثق
                    </span>
                  )}
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    selectedReview.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    selectedReview.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedReview.status === 'pending' ? 'قيد الانتظار' :
                     selectedReview.status === 'approved' ? 'مقبولة' : 'مرفوضة'}
                  </span>
                </div>
              </div>

              {/* Title & Comment */}
              {selectedReview.title && (
                <h4 className="text-lg font-medium text-slate-900 mb-2">{selectedReview.title}</h4>
              )}
              <p className="text-slate-600 mb-6 whitespace-pre-wrap">{selectedReview.comment}</p>

              {/* Pros & Cons */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {selectedReview.pros?.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h5 className="font-medium text-green-800 mb-2">المميزات</h5>
                    <ul className="space-y-1">
                      {selectedReview.pros.map((pro, i) => (
                        <li key={i} className="text-green-700 text-sm flex items-center gap-2">
                          <Check className="h-4 w-4" /> {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedReview.cons?.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-4">
                    <h5 className="font-medium text-red-800 mb-2">العيوب</h5>
                    <ul className="space-y-1">
                      {selectedReview.cons.map((con, i) => (
                        <li key={i} className="text-red-700 text-sm flex items-center gap-2">
                          <X className="h-4 w-4" /> {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Images */}
              {selectedReview.images?.length > 0 && (
                <div className="mb-6">
                  <h5 className="font-medium text-slate-900 mb-2">صور المراجعة</h5>
                  <div className="flex gap-2 flex-wrap">
                    {selectedReview.images.map((img, i) => (
                      <img key={i} src={img} alt={`Review ${i + 1}`} className="w-20 h-20 rounded-lg object-cover" />
                    ))}
                  </div>
                </div>
              )}

              {/* Meta Info */}
              <div className="text-sm text-slate-500 mb-6">
                <p>تم الإرسال: {formatDate(selectedReview.created_at)}</p>
                <p>عدد الأصوات المفيدة: {selectedReview.helpful_count}</p>
              </div>

              {/* Actions */}
              {selectedReview.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedReview.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                  >
                    <Check className="h-5 w-5" />
                    قبول المراجعة
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
                  >
                    <X className="h-5 w-5" />
                    رفض المراجعة
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">رفض المراجعة</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                سبب الرفض
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="اشرح سبب رفض المراجعة..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={4}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  تأكيد الرفض
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
