import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, LogOut, Lock, LayoutDashboard, Package, ShoppingBag, MessageSquare, TrendingUp, Users, DollarSign, Clock, Download, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import { 
  getCategories, 
  createProduct, 
  getProducts, 
  updateProduct, 
  deleteProduct,
  createCategory,
  updateCategory,
  getDashboardStats,
  getRecentOrders,
  updateOrderStatus,
  deleteOrder,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
  createHomeBanner
} from '@/db/api';
import { useAdmin } from '@/contexts/AdminContext';
import type { Category, Product, Order, Inquiry, DashboardStats } from '@/types/index';
import colorMap from '../lib/colorMap';
import ColorSelector from '@/components/ui/ColorSelector';

export default function AdminPage() {
  const { isAuthenticated, login, logout } = useAdmin();
  const [loginPassword, setLoginPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('all');
  const [inquiryPage, setInquiryPage] = useState(1);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalInquiries: 0,
    newInquiries: 0,
  });
  
  // UI states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inquiriesPerPage = 5;

  // 4-Image states
  const [images, setImages] = useState({
    front: null as File | null,
    back: null as File | null,
    left: null as File | null,
    right: null as File | null,
  });

  const [uploadedImages, setUploadedImages] = useState({
    front: '',
    back: '',
    left: '',
    right: '',
  });

  const [, setImageUploadProgress] = useState({
    front: 0,
    back: 0,
    left: 0,
    right: 0,
  });

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    sizes: '',
    colors: '',
    stock_quantity: '',
    show_on_home_banner: false,
    is_featured: false,
    is_new_arrival: false,
    is_trending: false,
  });

  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([]);

  const getColorSwatchValue = (color: string) =>
    colorMap[color.trim().toLowerCase()] || color.trim().toLowerCase();

  const normalizeKeyLocal = (s: string) => s.replace(/\s+|[-/\\.]/g, '').toLowerCase();

  const formatColorLabel = (color: string) =>
    color
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  
  useEffect(() => {
    async function loadData() {
      try {
        const [categoriesData, productsData, ordersData, inquiriesData, statsData] = await Promise.all([
          getCategories(),
          getProducts(),
          getRecentOrders(20),
          getInquiries(),
          getDashboardStats(),
        ]);
        console.log('[Admin] categories loaded:', categoriesData?.length ?? 0, categoriesData);
        
        // Ensure default categories exist
        await ensureDefaultCategories(categoriesData || []);
        
        // Reload categories after ensuring defaults
        const updatedCategories = await getCategories();
        setCategories(updatedCategories);
        
        setProducts(productsData);
        setOrders(ordersData);
        setInquiries(inquiriesData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setInquiryPage(1);
  }, [inquirySearch, inquiryStatusFilter]);

  const ensureDefaultCategories = async (existingCategories: Category[]) => {
    const defaultCategories = [
      { name: 'Men', slug: 'men', description: 'Fashion for men', image_url: '/images/categories/men.jpg', display_order: 1 },
      { name: 'Women', slug: 'women', description: 'Fashion for women', image_url: null, display_order: 2 },
      { name: 'Kids', slug: 'kids', description: 'Fashion for kids', image_url: '/images/categories/kids.jpg', display_order: 3 },
      { name: 'Boys', slug: 'boys', description: 'Fashion for boys', image_url: '/images/categories/boys.jpg', display_order: 4 },
      { name: 'Girls', slug: 'girls', description: 'Fashion for girls', image_url: '/images/categories/girls.jpg', display_order: 5 },
      { name: 'Thermal', slug: 'thermal', description: 'Thermal wear', image_url: '/images/categories/thermal.jpg', display_order: 6 },
    ];

    for (const category of defaultCategories) {
      const exists = existingCategories.some(c => c.slug === category.slug);
      if (!exists) {
        try {
          await createCategory(category);
          console.log(`Created category: ${category.name}`);
        } catch (error) {
          console.error(`Error creating category ${category.name}:`, error);
        }
      }
    }
  };

  // Handle main product image upload
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(20);

    try {
      const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;

      const { data, error } = await supabase.storage
        .from('product_images')
        .upload(fileName, file);

      if (error) {
        console.error('Upload error:', error);
        toast.error(`Upload failed: ${error.message}`);
        return;
      }

      setUploadProgress(80);

      const { data: urlData } = supabase.storage
        .from('product_images')
        .getPublicUrl(data.path);

      setFormData((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      setUploadProgress(100);
      toast.success('Main image uploaded successfully!');
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  // Handle 4-image uploads (front, back, left, right)
  const handleMultiImageChange = (type: 'front' | 'back' | 'left' | 'right', file: File | null) => {
    setImages(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const cleanName = file.name
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}_${cleanName}`;

    const { data, error } = await supabase.storage
      .from('product_images')
      .upload(fileName, file);

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from('product_images')
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  };

  const handleUploadAllImages = async () => {
    if (!images.front && !images.back && !images.left && !images.right) {
      toast.error("Please select at least one image");
      return;
    }

    setUploading(true);

    try {
      if (images.front) {
        const frontUrl = await uploadImage(images.front);
        setImageUploadProgress(prev => ({ ...prev, front: 100 }));
        setUploadedImages(prev => ({ ...prev, front: frontUrl }));
      }

      if (images.back) {
        const backUrl = await uploadImage(images.back);
        setImageUploadProgress(prev => ({ ...prev, back: 100 }));
        setUploadedImages(prev => ({ ...prev, back: backUrl }));
      }

      if (images.left) {
        const leftUrl = await uploadImage(images.left);
        setImageUploadProgress(prev => ({ ...prev, left: 100 }));
        setUploadedImages(prev => ({ ...prev, left: leftUrl }));
      }

      if (images.right) {
        const rightUrl = await uploadImage(images.right);
        setImageUploadProgress(prev => ({ ...prev, right: 100 }));
        setUploadedImages(prev => ({ ...prev, right: rightUrl }));
      }

      toast.success('Images uploaded successfully! 🚀');
    } catch (err) {
      console.error('Error uploading images:', err);
      toast.error('Error uploading images');
      setImageUploadProgress({ front: 0, back: 0, left: 0, right: 0 });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missing: string[] = [];
    if (!formData.name) missing.push('Product Name');
    if (!formData.price) missing.push('Price');
    if (!formData.image_url) missing.push('Product Image (upload first, wait for success)');
    if (missing.length > 0) {
      toast.error(`Missing: ${missing.join(', ')}`);
      return;
    }

    if (!selectedColors || selectedColors.length === 0) {
      toast.error('Please add at least one color for this product');
      return;
    }

    setLoading(true);

    const autoUpdateCategorySlugs = ['men', 'kids', 'boys', 'girls', 'thermal'];
    const currentCategory = categories.find((cat) => cat.id === formData.category_id);
    const shouldAutoUpdateCategoryImage =
      currentCategory &&
      autoUpdateCategorySlugs.includes(currentCategory.slug) &&
      !formData.show_on_home_banner;

    try {
      if (formData.show_on_home_banner && !editingProduct) {
        await createHomeBanner({
          label: formData.name || 'Homepage Banner',
          image_url: formData.image_url,
          category_id: formData.category_id || null,
        });

        toast.success('Homepage banner image saved successfully!');

        setDialogOpen(false);
        setEditingProduct(null);
        setFormData({
          name: '',
          slug: '',
          description: '',
          price: '',
          category_id: '',
          image_url: '',
          sizes: '',
          colors: '',
          stock_quantity: '',
          show_on_home_banner: false,
          is_featured: false,
          is_new_arrival: false,
          is_trending: false,
        });
        setSelectedColors([]);
        setImages({ front: null, back: null, left: null, right: null });
        setUploadedImages({ front: '', back: '', left: '', right: '' });
        setImageUploadProgress({ front: 0, back: 0, left: 0, right: 0 });

        const [productsData, categoriesData] = await Promise.all([getProducts(), getCategories()]);
        setProducts(productsData);
        setCategories(categoriesData);
        return;
      }

      const slug =
        formData.slug ||
        (formData.name || '')
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '') ||
        `product-${Date.now()}`;

      const additionalImages = [
        uploadedImages.front,
        uploadedImages.back,
        uploadedImages.left,
        uploadedImages.right,
      ].filter(url => url.length > 0);

      const productData: Record<string, unknown> = {
        name: formData.name,
        slug,
        description: formData.description || null,
        price: Number.parseFloat(formData.price),
        category_id: formData.category_id || null,
        image_url: formData.image_url,
        stock_quantity: Number.parseInt(formData.stock_quantity) || 0,
        additional_images: additionalImages.length > 0 ? additionalImages : (editingProduct?.additional_images || []),
        is_featured: formData.is_featured,
        is_new_arrival: formData.is_new_arrival,
        is_trending: formData.is_trending,
      };
      if (selectedColors && selectedColors.length > 0) {
        productData.colors = selectedColors.map((c) => c.name);
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success('Product updated successfully!');
      } else {
        await createProduct(productData);
        toast.success('Product created successfully!');
      }

      if (shouldAutoUpdateCategoryImage && currentCategory) {
        await updateCategory(currentCategory.id, { image_url: formData.image_url });
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      }

      setDialogOpen(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: '',
        category_id: '',
        image_url: '',
        sizes: '',
        colors: '',
        stock_quantity: '',
        show_on_home_banner: false,
        is_featured: false,
        is_new_arrival: false,
        is_trending: false,
      });
      setSelectedColors([]);
      setImages({ front: null, back: null, left: null, right: null });
      setUploadedImages({ front: '', back: '', left: '', right: '' });
      setImageUploadProgress({ front: 0, back: 0, left: 0, right: 0 });

      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price.toString(),
      category_id: product.category_id || '',
      image_url: product.image_url,
      sizes: product.sizes.join(', '),
      colors: product.colors.join(', '),
      stock_quantity: product.stock_quantity.toString(),
      show_on_home_banner: false,
      is_featured: product.is_featured,
      is_new_arrival: product.is_new_arrival,
      is_trending: product.is_trending,
    });
    // populate selectedColors for the color selector
    try {
      const sc = (product.colors || [])
        .map((name) => {
          const key = normalizeKeyLocal(name);
          const hex = colorMap[key];
          if (!hex) return null;
          return { name, hex };
        })
        .filter(Boolean) as { name: string; hex: string }[];
      setSelectedColors(sc);
    } catch (err) {
      setSelectedColors([]);
    }
    setImages({ front: null, back: null, left: null, right: null });
    setUploadedImages({ front: '', back: '', left: '', right: '' });
    setImageUploadProgress({ front: 0, back: 0, left: 0, right: 0 });
    setDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(productId);
      toast.success('Product deleted successfully!');
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: Order['status']) => {
    // Optimistically update the local order state so the UI updates instantly.
    const currentOrders = orders;
    const updatedOrders = currentOrders.map((order) =>
      order.id === orderId ? { ...order, status } : order
    );
    setOrders(updatedOrders);

    try {
      await updateOrderStatus(orderId, status);
      toast.success('Order status updated!');

      // Refresh stats from backend to keep dashboard analytics accurate.
      const statsData = await getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');

      // Revert local UI state on failure.
      setOrders(currentOrders);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      await deleteOrder(orderId);
      toast.success('Order deleted successfully!');
      const [ordersData, statsData] = await Promise.all([
        getRecentOrders(20),
        getDashboardStats(),
      ]);
      setOrders(ordersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  const refreshInquiryData = async () => {
    const [inquiriesData, statsData] = await Promise.all([
      getInquiries(),
      getDashboardStats(),
    ]);
    setInquiries(inquiriesData);
    setStats(statsData);
  };

  const handleInquiryStatusChange = async (inquiryId: string, status: Inquiry['status']) => {
    try {
      await updateInquiryStatus(inquiryId, status);
      toast.success('Inquiry status updated!');
      await refreshInquiryData();
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      toast.error('Failed to update inquiry status');
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      await deleteInquiry(inquiryId);
      toast.success('Inquiry deleted successfully!');
      await refreshInquiryData();
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast.error('Failed to delete inquiry');
    }
  };

  const formatWhatsAppNumber = (phone: string | null) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (!digits) return '';
    return digits.startsWith('91') ? digits : `91${digits}`;
  };

  const handleInquiryWhatsApp = (inquiry: Inquiry) => {
    const phone = formatWhatsAppNumber(inquiry.phone);
    if (!phone) {
      toast.error('Phone number missing for this inquiry');
      return;
    }

    const message = `Hello ${inquiry.name}, thanks for contacting Gunjan Hosrey. We received your inquiry${inquiry.subject ? ` about "${inquiry.subject}"` : ''}.`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  const exportInquiriesToCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Subject', 'Message', 'Status', 'Created At'];
    const escapeCSV = (value: string | null | undefined) =>
      `"${String(value ?? '').replace(/"/g, '""')}"`;

    const rows = filteredInquiries.map((inquiry) =>
      [
        inquiry.name,
        inquiry.phone,
        inquiry.email,
        inquiry.subject,
        inquiry.message,
        inquiry.status,
        new Date(inquiry.created_at).toLocaleString(),
      ].map(escapeCSV).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(loginPassword)) {
      toast.success('Login successful!');
      setLoginPassword('');
    } else {
      toast.error('Invalid password');
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      sizes: '',
      colors: '',
      stock_quantity: '',
      show_on_home_banner: false,
      is_featured: false,
      is_new_arrival: false,
      is_trending: false,
    });
    setDialogOpen(true);
  };

  const normalizedInquirySearch = inquirySearch.trim().toLowerCase();
  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      !normalizedInquirySearch ||
      inquiry.name?.toLowerCase().includes(normalizedInquirySearch) ||
      inquiry.email?.toLowerCase().includes(normalizedInquirySearch) ||
      inquiry.phone?.toLowerCase().includes(normalizedInquirySearch) ||
      inquiry.subject?.toLowerCase().includes(normalizedInquirySearch) ||
      inquiry.message?.toLowerCase().includes(normalizedInquirySearch);

    const matchesStatus =
      inquiryStatusFilter === 'all' || inquiry.status === inquiryStatusFilter;

    return matchesSearch && matchesStatus;
  });
  const totalInquiryCount = inquiries.length;
  const newInquiryCount = inquiries.filter((inquiry) => inquiry.status === 'new').length;
  const inProgressInquiryCount = inquiries.filter((inquiry) => inquiry.status === 'in_progress').length;
  const resolvedInquiryCount = inquiries.filter((inquiry) => inquiry.status === 'resolved').length;
  const inquiryPageCount = Math.max(1, Math.ceil(filteredInquiries.length / inquiriesPerPage));
  const safeInquiryPage = Math.min(inquiryPage, inquiryPageCount);
  const inquiryStartIndex = (safeInquiryPage - 1) * inquiriesPerPage;
  const paginatedInquiries = filteredInquiries.slice(
    inquiryStartIndex,
    inquiryStartIndex + inquiriesPerPage
  );
  const navigationItems = [
    { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { value: 'products', label: 'Products', icon: Package },
    { value: 'orders', label: 'Orders', icon: ShoppingBag },
    { value: 'inquiries', label: 'Inquiries', icon: MessageSquare },
  ] as const;
  const activeSectionLabel =
    navigationItems.find((item) => item.value === activeTab)?.label || 'Dashboard';

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Lock className="h-6 w-6" />
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-white/60 bg-slate-950 px-5 py-6 text-white shadow-2xl lg:border-b-0 lg:border-r lg:border-slate-800/80">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Gunjan Hosrey</p>
              <h1 className="text-xl font-semibold">Admin Suite</h1>
            </div>
          </div>

          <TabsList className="grid h-auto w-full gap-2 bg-transparent p-0">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="h-12 w-full justify-start rounded-2xl border border-transparent px-4 text-left text-sm font-medium text-slate-300 transition data-[state=active]:border-white/10 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-lg"
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-8 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <p className="font-medium">Live snapshot</p>
            <p className="mt-2 text-emerald-50/80">{stats.totalInquiries} inquiries and {stats.totalOrders} orders tracked.</p>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Admin Panel</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">{activeSectionLabel}</h2>
                <p className="text-sm text-slate-500">Premium workspace for catalog, orders, and customer operations.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">User</p>
                  <p className="text-sm font-semibold text-slate-900">Admin</p>
                </div>
                <Button variant="outline" className="rounded-2xl border-slate-300 bg-white px-4 shadow-sm" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8">

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <Card className="overflow-hidden rounded-[28px] border-0 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.8)]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Total Revenue</CardTitle>
                  <DollarSign className="h-5 w-5 text-sky-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">Rs. {stats.totalRevenue.toFixed(2)}</div>
                  <p className="mt-1 text-xs text-slate-300">
                    From {stats.totalOrders} orders
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border border-slate-200/70 bg-white/90 shadow-[0_20px_70px_-36px_rgba(15,23,42,0.35)]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingBag className="h-5 w-5 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stats.totalOrders}</div>
                  <p className="mt-1 text-xs text-slate-500">
                    {stats.pendingOrders} pending, {stats.completedOrders} completed
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border border-sky-100 bg-sky-50/90 shadow-[0_20px_70px_-36px_rgba(14,165,233,0.35)]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
                  <MessageSquare className="h-5 w-5 text-sky-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stats.totalInquiries}</div>
                  <p className="mt-1 text-xs text-slate-600">
                    {stats.newInquiries} new inquiries
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border border-slate-200/70 bg-white/90 shadow-[0_20px_70px_-36px_rgba(15,23,42,0.35)]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-5 w-5 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{products.length}</div>
                  <p className="mt-1 text-xs text-slate-500">
                    Active products in catalog
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border border-amber-100 bg-amber-50/90 shadow-[0_20px_70px_-36px_rgba(245,158,11,0.35)]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  <Clock className="h-5 w-5 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stats.pendingOrders}</div>
                  <p className="mt-1 text-xs text-slate-600">
                    Awaiting processing
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border border-emerald-100 bg-emerald-50/90 shadow-[0_20px_70px_-36px_rgba(16,185,129,0.35)]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">
                    Rs. {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Per order
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="rounded-[32px] border border-slate-200/70 bg-white/90 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)]">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 10).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            #{order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customer_name}</div>
                              <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{order.order_items.length} items</TableCell>
                          <TableCell className="font-semibold">₹{order.total_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              order.status === 'complete' ? 'default' :
                              order.status === 'pending' ? 'secondary' :
                              order.status === 'progress' || order.status === 'onway' ? 'outline' : 'destructive'
                            }>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Management</h2>
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Products ({products.length})</CardTitle>
              </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>₹{product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock_quantity}</TableCell>
                      <TableCell>
                        {categories.find((c) => c.id === product.category_id)?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {product.is_featured && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              Featured
                            </span>
                          )}
                          {product.is_new_arrival && (
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                              New
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Orders ({orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            #{order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{order.customer_name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {order.customer_address}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{order.customer_phone}</div>
                            {order.customer_email && (
                              <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>{order.order_items.length} items</div>
                            <div className="text-sm text-muted-foreground">
                              {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} units
                            </div>
                            <div className="mt-3 space-y-2">
                              {order.order_items.slice(0, 2).map((item, index) => (
                                <div
                                  key={`${order.id}-${item.product_id}-${index}`}
                                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                                >
                                  <img
                                    src={item.product_image}
                                    alt={item.product_name}
                                    className="h-10 w-10 rounded-lg object-cover"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-medium">{item.product_name}</div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                      {item.size && <span>Size: {item.size}</span>}
                                      {item.color && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-700">
                                          <span
                                            className="h-2.5 w-2.5 rounded-full border border-slate-300"
                                            style={{ backgroundColor: getColorSwatchValue(item.color) }}
                                          />
                                          {formatColorLabel(item.color)}
                                        </span>
                                      )}
                                      <span>x{item.quantity}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {order.order_items.length > 2 && (
                                <div className="text-xs text-slate-500">
                                  +{order.order_items.length - 2} more item(s)
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹{order.total_amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{order.payment_method || 'N/A'}</div>
                              <div className={`text-xs ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                                {order.payment_status || 'pending'}
                              </div>
                              {order.transaction_id && (
                                <div className="text-xs text-muted-foreground font-mono">
                                  {order.transaction_id}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleOrderStatusChange(order.id, value as Order['status'])}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="progress">In Progress</SelectItem>
                                <SelectItem value="onway">On The Way</SelectItem>
                                <SelectItem value="complete">Completed</SelectItem>
                                <SelectItem value="cancel">Cancelled</SelectItem>
                                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(order.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const items = order.order_items.map(item => 
                                  `${item.product_name} (${item.size}, ${item.color}) x${item.quantity}`
                                ).join('\n');
                                alert(`Order Details:\n\n${items}\n\nTotal: ₹${order.total_amount.toFixed(2)}`);
                              }}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteOrder(order.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries" className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Inquiries</p>
                    <p className="text-3xl font-bold">{totalInquiryCount}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">Needs Attention</p>
                    <p className="text-3xl font-bold">{newInquiryCount}</p>
                    <p className="text-xs text-muted-foreground">{inProgressInquiryCount} in progress</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-orange-500" />
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-emerald-500">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-3xl font-bold">{resolvedInquiryCount}</p>
                  </div>
                  <Clock className="h-8 w-8 text-emerald-500" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="gap-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Customer Inquiries ({filteredInquiries.length})</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Search, update, export, and respond to leads from one place.
                    </p>
                  </div>
                  <Button variant="outline" onClick={exportInquiriesToCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <Input
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    placeholder="Search name, email, phone, subject, message"
                    className="md:max-w-md"
                  />
                  <Select value={inquiryStatusFilter} onValueChange={setInquiryStatusFilter}>
                    <SelectTrigger className="md:w-52">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedInquiries.map((inquiry) => (
                        <TableRow key={inquiry.id}>
                          <TableCell className="font-medium">{inquiry.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">{inquiry.phone || 'No phone'}</div>
                            <div className="text-sm text-muted-foreground">{inquiry.email || 'No email'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{inquiry.subject || 'General inquiry'}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(inquiry.created_at).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="line-clamp-3 text-sm">{inquiry.message}</div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Badge
                                variant={
                                  inquiry.status === 'resolved'
                                    ? 'default'
                                    : inquiry.status === 'in_progress'
                                      ? 'outline'
                                      : 'secondary'
                                }
                                className="capitalize"
                              >
                                {inquiry.status.replace('_', ' ')}
                              </Badge>
                              <Select
                                value={inquiry.status}
                                onValueChange={(value) => handleInquiryStatusChange(inquiry.id, value as Inquiry['status'])}
                              >
                                <SelectTrigger className="w-36">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleInquiryWhatsApp(inquiry)}
                              >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                WhatsApp
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteInquiry(inquiry.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {paginatedInquiries.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                            No inquiries matched your current search/filter.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredInquiries.length === 0 ? 0 : inquiryStartIndex + 1}
                    {' '}to {Math.min(inquiryStartIndex + inquiriesPerPage, filteredInquiries.length)} of {filteredInquiries.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safeInquiryPage === 1}
                      onClick={() => setInquiryPage((page) => Math.max(1, page - 1))}
                    >
                      Prev
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {safeInquiryPage} of {inquiryPageCount}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safeInquiryPage >= inquiryPageCount}
                      onClick={() => setInquiryPage((page) => Math.min(inquiryPageCount, page + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          </div>
        </div>
      </Tabs>

        {/* Add/Edit Product Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription className="sr-only">
                Form to add or edit product details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category (optional)</Label>
                    <Select
                      value={formData.category_id || 'none'}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value === 'none' ? '' : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No category</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">Product Image (Main Thumbnail) *</Label>
                  <div className="space-y-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageUpload}
                      disabled={uploading}
                    />
                    {uploading && (
                      <div className="space-y-1">
                        <Progress value={uploadProgress} />
                        <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                  {formData.image_url && (
                    <div className="mt-2">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded"
                      />
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="show-home-banner"
                        checked={formData.show_on_home_banner}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, show_on_home_banner: checked as boolean })
                        }
                        disabled={Boolean(editingProduct)}
                      />
                      <div>
                        <Label htmlFor="show-home-banner">Show on Home Page Main Image</Label>
                        <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                          When enabled, the uploaded image will be used only for the homepage hero/main banner and will not be saved as a normal product image.
                          This option is disabled while editing an existing product.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4-Image System (Front, Back, Left, Right) */}
                <div className="space-y-3 border-2 border-dashed border-amber-300 p-4 rounded-lg bg-amber-50">
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Front Image */}
                    <div className="space-y-2">
                      <Label htmlFor="image-front" className="text-sm">Front Image</Label>
                      <div className="relative">
                        <Input
                          id="image-front"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMultiImageChange('front', e.target.files?.[0] || null)}
                          disabled={uploading}
                          className="text-xs"
                        />
                        {images.front && (
                          <span className="absolute right-2 top-2 text-green-600 text-sm">✓</span>
                        )}
                      </div>
                      {uploadedImages.front && (
                        <img src={uploadedImages.front} alt="Front" className="w-16 h-16 object-cover rounded" />
                      )}
                    </div>

                    {/* Back Image */}
                    <div className="space-y-2">
                      <Label htmlFor="image-back" className="text-sm">Back Image</Label>
                      <div className="relative">
                        <Input
                          id="image-back"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMultiImageChange('back', e.target.files?.[0] || null)}
                          disabled={uploading}
                          className="text-xs"
                        />
                        {images.back && (
                          <span className="absolute right-2 top-2 text-green-600 text-sm">✓</span>
                        )}
                      </div>
                      {uploadedImages.back && (
                        <img src={uploadedImages.back} alt="Back" className="w-16 h-16 object-cover rounded" />
                      )}
                    </div>

                    {/* Left Image */}
                    <div className="space-y-2">
                      <Label htmlFor="image-left" className="text-sm">Left Image</Label>
                      <div className="relative">
                        <Input
                          id="image-left"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMultiImageChange('left', e.target.files?.[0] || null)}
                          disabled={uploading}
                          className="text-xs"
                        />
                        {images.left && (
                          <span className="absolute right-2 top-2 text-green-600 text-sm">✓</span>
                        )}
                      </div>
                      {uploadedImages.left && (
                        <img src={uploadedImages.left} alt="Left" className="w-16 h-16 object-cover rounded" />
                      )}
                    </div>

                    {/* Right Image */}
                    <div className="space-y-2">
                      <Label htmlFor="image-right" className="text-sm">Right Image</Label>
                      <div className="relative">
                        <Input
                          id="image-right"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMultiImageChange('right', e.target.files?.[0] || null)}
                          disabled={uploading}
                          className="text-xs"
                        />
                        {images.right && (
                          <span className="absolute right-2 top-2 text-green-600 text-sm">✓</span>
                        )}
                      </div>
                      {uploadedImages.right && (
                        <img src={uploadedImages.right} alt="Right" className="w-16 h-16 object-cover rounded" />
                      )}
                    </div>
                  </div>

                  <Button 
                    type="button"
                    onClick={handleUploadAllImages}
                    disabled={uploading || (!images.front && !images.back && !images.left && !images.right)}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    {uploading ? '⏳ Uploading...' : '🚀 Upload All 4 Images'}
                  </Button>

                  {Object.values(uploadedImages).filter(url => url).length > 0 && (
                    <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
                      ✓ {Object.values(uploadedImages).filter(url => url).length}/4 images ready!
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                    <Input
                      id="sizes"
                      value={formData.sizes}
                      onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                      placeholder="S, M, L, XL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="colors">Colors (comma-separated)</Label>
                    <div>
                      <ColorSelector value={selectedColors} onChange={setSelectedColors} />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_featured: checked as boolean })
                      }
                    />
                    <Label htmlFor="featured">Featured Product</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new"
                      checked={formData.is_new_arrival}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_new_arrival: checked as boolean })
                      }
                    />
                    <Label htmlFor="new">New Arrival</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trending"
                      checked={formData.is_trending}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_trending: checked as boolean })
                      }
                    />
                    <Label htmlFor="trending">Trending</Label>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading || uploading}>
                  {loading ? (editingProduct ? 'Updating...' : 'Creating...') : (editingProduct ? 'Update Product' : 'Create Product')}
                </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
