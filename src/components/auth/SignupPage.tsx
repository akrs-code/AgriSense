import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Sprout } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { UserRole } from '../../types/enums';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    role: '' as UserRole,
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone || !formData.role || !formData.name || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });
      
      toast.success('Account created successfully!');
      
      // Navigate to appropriate dashboard based on role
      switch (formData.role) {
        case 'seller':
          navigate('/seller/verification');
          break;
        case 'buyer':
          navigate('/buyer/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-primary-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sprout className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-text mb-2">Join AgriSense</h1>
          <p className="text-text-muted">Create your account to get started</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-neutral-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+63 9XX XXX XXXX"
                  className="w-full pl-12 pr-4 py-4 border border-neutral-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-text mb-3">
                I want to: *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: UserRole.Buyer })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'buyer'
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-neutral-border hover:border-text-muted'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🛒</div>
                    <div className="font-semibold">Buy Products</div>
                    <div className="text-xs text-text-muted">As a Buyer</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: UserRole.Seller })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'seller'
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-neutral-border hover:border-text-muted'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🌾</div>
                    <div className="font-semibold">Sell Products</div>
                    <div className="text-xs text-text-muted">As a Farmer</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-4 border border-neutral-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Email (shown only for farmers) */}
            {formData.role === 'seller' && (
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-4 border border-neutral-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Email helps with verification and important updates
                </p>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  className="w-full pl-12 pr-12 py-4 border border-neutral-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-12 py-4 border border-neutral-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-4 px-6 rounded-xl font-semibold hover:from-primary-dark hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Role-specific info */}
          {formData.role && (
            <div className="mt-6 p-4 bg-neutral rounded-xl">
              <p className="text-xs text-text-muted mb-2 font-medium">
                {formData.role === 'seller' ? 'As a Farmer:' : 'As a Buyer:'}
              </p>
              <div className="space-y-1 text-xs text-text-muted">
                {formData.role === 'seller' ? (
                  <>
                    <p>• Complete verification to start selling</p>
                    <p>• List your crops and manage orders</p>
                    <p>• Access market intelligence and insights</p>
                  </>
                ) : (
                  <>
                    <p>• Browse fresh crops from local farmers</p>
                    <p>• Direct messaging with sellers</p>
                    <p>• Track orders and leave reviews</p>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-dark font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};