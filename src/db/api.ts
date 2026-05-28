import { supabase } from './supabase';
import type { Category, Product, HomeBanner, Order, OrderItem, Inquiry, DashboardStats } from '@/types/index';

const allowedCategorySlugs = new Set(['men', 'women', 'kids', 'boys', 'girls']);

const normalizeStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(String).map((item) => item.trim()).filter(Boolean);
        }
      } catch {
        // Fall back to loose parsing below.
      }
    }

    return value
      .split(',')
      .map((item) => item.trim().replace(/^['"\[\]]+|['"\[\]]+$/g, ''))
      .filter(Boolean);
  }

  return [];
};

const normalizeProduct = (product: any): Product => {
  const additionalImages = Array.isArray(product.additional_images)
    ? product.additional_images.map(String)
    : [];

  return {
    ...product,
    image_url: product.image_url ?? product.image ?? '',
    slug:
      product.slug ??
      (product.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    additional_images: additionalImages,
    sizes: normalizeStringList(product.sizes),
    colors: normalizeStringList(product.colors),
  };
};

const normalizeOrder = (order: any): Order => ({
  ...order,
  customer_name: order.customer_name ?? order.name ?? '',
  customer_email: order.customer_email ?? order.email ?? null,
  customer_phone: order.customer_phone ?? order.phone ?? '',
  customer_address: order.customer_address ?? order.address ?? null,
  payment_method: order.payment_method ?? null,
  payment_status: order.payment_status ?? 'pending',
  transaction_id: order.transaction_id ?? null,
  total_amount: Number(order.total_amount ?? 0),
  status: order.status ?? 'pending',
  order_items: Array.isArray(order.order_items) ? order.order_items : [],
});

// Categories
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[getCategories] Supabase error:', error.message, error.code);
    return [];
  }
  return Array.isArray(data)
    ? data.filter((category) => allowedCategorySlugs.has(category.slug))
    : [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();

  if (error) {
    console.error('[createCategory] Supabase error:', error.message, error.code);
    throw error;
  }
  return data;
}

export async function updateCategory(id: string, payload: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updateCategory] Supabase error:', error.message, error.code);
    throw error;
  }
  return data;
}

export async function getHomeBanner(): Promise<HomeBanner | null> {
  const { data, error } = await supabase
    .from('home_banners')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[getHomeBanner] Supabase error:', error.message, error.code);
    return null;
  }
  return data;
}

export async function createHomeBanner(banner: { label: string; image_url: string; category_id?: string | null; }): Promise<HomeBanner> {
  const { data, error } = await supabase
    .from('home_banners')
    .insert([{ ...banner, category_id: banner.category_id ?? null }])
    .select()
    .single();

  if (error) {
    console.error('[createHomeBanner] Supabase error:', error.message, error.code);
    throw error;
  }
  return data;
}

// Products
// GET - normalizes image column to image_url for frontend
export const getProducts = async () => {
  const { data, error } = await supabase.from('products').select('*')
  if (error) {
    console.error('[getProducts]', error)
    return []
  }
  return (data || []).map(normalizeProduct)
}

// ADD
export const addProduct = async (product) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single()

  if (error) {
    console.error('[addProduct] INSERT ERROR:', error.message, error.code, error.details);
    throw error;
  }
  return data;
}

// UPDATE
export const updateProduct = async (id, dataUpdate) => {
  const { data, error } = await supabase
    .from('products')
    .update(dataUpdate)
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) {
    console.error('[updateProduct] UPDATE ERROR:', error.message, error.code);
    throw error;
  }
  return data;
}

// DELETE
export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[deleteProduct] DELETE ERROR:', error.message, error.code);
    throw error;
  }
}

export const deleteOrder = async (id: string) => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[deleteOrder] DELETE ERROR:', error.message, error.code);
    throw error;
  }
}

// GET PRODUCTS BY CATEGORY
export const getProductsByCategory = async (categoryId) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)

  if (error) console.log(error)
  return (data || []).map(normalizeProduct)
}

// SEARCH PRODUCTS
export const searchProducts = async (query) => {
  const trimmedQuery = String(query || '').trim()

  if (!trimmedQuery) {
    return []
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${trimmedQuery}%,description.ilike.%${trimmedQuery}%,slug.ilike.%${trimmedQuery}%`)

  if (error) console.log(error)
  return (data || []).map(normalizeProduct)
}

// GET PRODUCT BY SLUG
export const getProductBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .limit(1)

  if (error) {
    console.error('[getProductBySlug] Supabase error:', error.message, error.code);
    return null;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return normalizeProduct(data[0]);
}

// CREATE PRODUCT (alias for addProduct)
export const createProduct = addProduct

// TEST ALL
const test = async () => {
  // ADD
  await addProduct({ name: 'Test', price: 100 })

  // GET
  const data = await getProducts()
  console.log(data)

  // UPDATE
  if (data.length > 0) {
    await updateProduct(data[0].id, { name: 'Updated' })
  }

  // DELETE
  if (data.length > 0) {
    await deleteProduct(data[0].id)
  }
}

// Orders
export async function createOrder(orderData: {
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  customer_address: string;
  payment_method?: string | null;
  payment_status?: string;
  transaction_id?: string | null;
  total_amount: number;
  order_items: OrderItem[];
}): Promise<Order> {
  const primaryPayload = {
    customer_name: orderData.customer_name,
    phone: orderData.customer_phone,
    email: orderData.customer_email,
    address: orderData.customer_address,
    payment_method: orderData.payment_method ?? null,
    payment_status: orderData.payment_status ?? 'pending',
    transaction_id: orderData.transaction_id ?? null,
    total_amount: orderData.total_amount,
    order_items: orderData.order_items,
    status: 'pending'
  };

  const { data, error } = await supabase
    .from('orders')
    .insert(primaryPayload)
    .select()
    .single();

  if (!error && data) return normalizeOrder(data);

  const message = error?.message || '';
  const fallbackSchemaError =
    message.includes('customer_address') ||
    message.includes('customer_phone') ||
    message.includes('customer_email');

  if (!fallbackSchemaError) throw error;

  const fallbackPayload = {
    customer_name: orderData.customer_name,
    customer_email: orderData.customer_email,
    customer_phone: orderData.customer_phone,
    customer_address: orderData.customer_address,
    payment_method: orderData.payment_method ?? null,
    payment_status: orderData.payment_status ?? 'pending',
    transaction_id: orderData.transaction_id ?? null,
    total_amount: orderData.total_amount,
    order_items: orderData.order_items,
    status: 'pending'
  };

  const { data: fallbackData, error: fallbackError } = await supabase
    .from('orders')
    .insert(fallbackPayload)
    .select()
    .single();

  if (fallbackError) throw fallbackError;
  return normalizeOrder(fallbackData);
}

// Inquiries
export async function createInquiry(inquiryData: Omit<Inquiry, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<Inquiry> {
  const payload = {
    name: inquiryData.name,
    phone: inquiryData.phone || null,
    email: inquiryData.email || null,
    subject: inquiryData.subject || null,
    message: inquiryData.message,
    status: 'new' as const,
  };

  const { data, error } = await supabase
    .from('inquiries')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInquiries(): Promise<Inquiry[]> {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!Array.isArray(data)) return [];

  return data.map((inquiry) => ({
    ...inquiry,
    email: inquiry.email || '',
    phone: inquiry.phone || null,
    subject: inquiry.subject || null,
    status: inquiry.status || 'new',
  }));
}

export async function updateInquiryStatus(id: string, status: 'new' | 'in_progress' | 'resolved'): Promise<Inquiry> {
  const { data, error } = await supabase
    .from('inquiries')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteInquiry(id: string): Promise<void> {
  const { error } = await supabase
    .from('inquiries')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Dashboard Analytics
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get orders data
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount, status');

    if (ordersError) throw ordersError;

    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
    const completedOrders = orders?.filter(o => o.status === 'complete').length || 0;

    // Get inquiries data
    const { data: inquiries, error: inquiriesError } = await supabase
      .from('inquiries')
      .select('status');

    if (inquiriesError) throw inquiriesError;

    const totalInquiries = inquiries?.length || 0;
    const newInquiries = inquiries?.filter(i => i.status === 'new').length || 0;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      totalInquiries,
      newInquiries,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalInquiries: 0,
      newInquiries: 0,
    };
  }
}

export async function getRecentOrders(limit: number = 10): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return Array.isArray(data) ? data.map(normalizeOrder) : [];
}

export async function getOrdersForCustomer(params: {
  email?: string | null;
  phone?: string | null;
}): Promise<Order[]> {
  const email = params.email?.trim();
  const phone = params.phone?.trim();

  if (!email && !phone) return [];

  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

  if (email && phone) {
    query = query.or(`customer_email.eq.${email},email.eq.${email},customer_phone.eq.${phone},phone.eq.${phone}`);
  } else if (email) {
    query = query.or(`customer_email.eq.${email},email.eq.${email}`);
  } else if (phone) {
    query = query.or(`customer_phone.eq.${phone},phone.eq.${phone}`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return Array.isArray(data) ? data.map(normalizeOrder) : [];
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return normalizeOrder(data);
}
