import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Info,
  Lock,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import {
  DEFAULT_DELIVERY_FEE_MAD,
  DEFAULT_WHATSAPP_NUMBER,
  ORDER_STATUS_META,
  computeOrderStats,
  getProductSizeText,
  isValidWhatsAppNumber,
  normalizeWhatsAppNumber,
  restoreCreedAventus,
  saveProductToList,
  validateAdminCredentials,
  type OrderStatus,
  type OwnerOrder,
  type Perfume,
  type StoreSettings,
} from '../utils/store';
import { processUploadedProductImage } from '../utils/imageUpload';

interface AdminModalProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  ownerToken: string | null;
  products: readonly Perfume[];
  settings: StoreSettings;
  onClose: () => void;
  onAuthenticated: (token: string | null) => void;
  onLogout: () => void;
  onSaveProducts: (nextProducts: Perfume[]) => void;
  onSaveSettings: (nextSettings: StoreSettings) => void;
  onResetDefaults: () => void;
}

interface ProductFormState {
  name: string;
  price: string;
  sizeLabel: string;
  image: string;
  description: string;
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
}

const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: '',
  price: '50',
  sizeLabel: '10 مل',
  image: '',
  description: '',
  topNotes: '',
  heartNotes: '',
  baseNotes: '',
};

export function AdminModal({
  isOpen,
  isAuthenticated,
  ownerToken,
  products,
  settings,
  onClose,
  onAuthenticated,
  onLogout,
  onSaveProducts,
  onSaveSettings,
  onResetDefaults,
}: AdminModalProps) {
  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin workspace tabs
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'orders'>(
    'products',
  );

  // Product form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productForm, setProductForm] =
    useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [productError, setProductError] = useState('');
  const [productFeedback, setProductFeedback] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // Settings form state
  const [whatsappInput, setWhatsappInput] = useState(settings.whatsappNumber);
  const [deliveryInput, setDeliveryInput] = useState(
    String(settings.deliveryFeeMad),
  );
  const [settingsError, setSettingsError] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Orders tab state
  const [orders, setOrders] = useState<OwnerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const productFormCardRef = useRef<HTMLDivElement>(null);
  const productNameInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewError(false);
  }, [productForm.image]);

  useEffect(() => {
    setWhatsappInput(settings.whatsappNumber);
    setDeliveryInput(String(settings.deliveryFeeMad));
  }, [settings]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const fetchOrders = useCallback(async () => {
    if (!ownerToken) return;
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/owner/orders', {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      }
    } catch {
      // Ignore transient network errors
    } finally {
      setOrdersLoading(false);
    }
  }, [ownerToken]);

  useEffect(() => {
    if (isOpen && isAuthenticated && activeTab === 'orders' && ownerToken) {
      fetchOrders();
    }
  }, [isOpen, isAuthenticated, activeTab, ownerToken, fetchOrders]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setLoginError('يرجى إدخال اسم المستخدم وكلمة المرور.');
      return;
    }
    if (!validateAdminCredentials(username, password)) {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');
    let token: string | null = null;
    try {
      const res = await fetch('/api/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        token = data.token ?? null;
      }
    } catch {
      // Allow local admin session even if backend is unreachable
    } finally {
      setIsLoggingIn(false);
    }
    setUsername('');
    setPassword('');
    onAuthenticated(token);
  };

  const handleStartEdit = (perfume: Perfume) => {
    setEditingId(perfume.id);
    setProductError('');
    setProductFeedback('');
    setProductForm({
      name: perfume.arabicName,
      price: String(perfume.priceMad),
      sizeLabel: getProductSizeText(perfume),
      image: perfume.image,
      description: perfume.description,
      topNotes: perfume.notes.top.join('، '),
      heartNotes: perfume.notes.heart.join('، '),
      baseNotes: perfume.notes.base.join('، '),
    });
    window.requestAnimationFrame(() => {
      productFormCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
      productNameInputRef.current?.focus();
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setProductForm(EMPTY_PRODUCT_FORM);
    setProductError('');
    setProductFeedback('');
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = '';
    }
  };

  const handleImageFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProductError('');
    setImageUploading(true);
    try {
      const dataUrl = await processUploadedProductImage(file);
      setProductForm((prev) => ({ ...prev, image: dataUrl }));
      setPreviewError(false);
    } catch (err) {
      setProductError(
        err instanceof Error ? err.message : 'تعذر تحميل الصورة المختارة.',
      );
    } finally {
      setImageUploading(false);
      if (imageFileInputRef.current) {
        imageFileInputRef.current.value = '';
      }
    }
  };

  const handleClearProductImage = () => {
    setProductForm((prev) => ({ ...prev, image: '' }));
    setPreviewError(false);
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = '';
    }
  };

  const handleRestoreAventus = () => {
    const nextProducts = restoreCreedAventus(products);
    onSaveProducts(nextProducts);
    setProductFeedback('تمت استعادة عطر "كريد أفنتوس" ببياناته الأصلية.');
  };

  const handleSaveProduct = (e: FormEvent) => {
    e.preventDefault();
    setProductError('');
    setProductFeedback('');

    const parsedPrice = Number(productForm.price);
    if (productForm.name.trim().length < 2) {
      setProductError('يرجى إدخال اسم العطر.');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 1) {
      setProductError('يرجى إدخال سعر صحيح بالدرهم.');
      return;
    }
    if (!productForm.sizeLabel.trim()) {
      setProductError('يرجى تحديد الحجم أو السعة (مثال: 10 مل).');
      return;
    }
    if (productForm.description.trim().length < 3) {
      setProductError('يرجى كتابة وصف مختصر للعطر.');
      return;
    }

    const result = saveProductToList(
      products,
      {
        name: productForm.name,
        priceMad: parsedPrice,
        image: productForm.image,
        sizeLabel: productForm.sizeLabel,
        description: productForm.description,
        topNotes: productForm.topNotes,
        heartNotes: productForm.heartNotes,
        baseNotes: productForm.baseNotes,
      },
      editingId,
    );

    onSaveProducts(result.products);
    setProductFeedback(
      result.mode === 'updated'
        ? `تم تحديث "${result.saved.arabicName}" وحفظه في المتصفح بنجاح.`
        : `تمت إضافة "${result.saved.arabicName}" إلى المتجر بنجاح.`,
    );

    setEditingId(null);
    setProductForm(EMPTY_PRODUCT_FORM);
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = '';
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (editingId === id) {
      handleCancelEdit();
    }
    onSaveProducts(products.filter((p) => p.id !== id));
    setProductFeedback('تم حذف المنتج.');
  };

  const handleSaveSettings = (e: FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSaved(false);

    if (!isValidWhatsAppNumber(whatsappInput)) {
      setSettingsError(
        `يرجى إدخال رقم واتساب صحيح (مثال: ${DEFAULT_WHATSAPP_NUMBER}).`,
      );
      return;
    }

    const parsedFee = Number(deliveryInput);
    if (!Number.isFinite(parsedFee) || parsedFee < 0) {
      setSettingsError('يرجى إدخال رسوم توصيل صحيحة (0 أو أكثر).');
      return;
    }

    const nextSettings: StoreSettings = {
      whatsappNumber: normalizeWhatsAppNumber(whatsappInput),
      deliveryFeeMad: Math.round(parsedFee),
    };
    onSaveSettings(nextSettings);
    setWhatsappInput(nextSettings.whatsappNumber);
    setDeliveryInput(String(nextSettings.deliveryFeeMad));
    setSettingsSaved(true);
  };

  const handleConfirmReset = () => {
    onResetDefaults();
    setConfirmResetOpen(false);
    setEditingId(null);
    setProductForm(EMPTY_PRODUCT_FORM);
    setProductError('');
    setSettingsError('');
    setSettingsSaved(true);
    setProductFeedback('تمت استعادة المنتجات والإعدادات الافتراضية بنجاح.');
  };

  const handleStatusChange = async (
    orderNumber: string,
    status: OrderStatus,
  ) => {
    if (!ownerToken) return;
    try {
      const res = await fetch(
        `/api/owner/orders/${encodeURIComponent(orderNumber)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({ status }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrders((prev) =>
            prev.map((o) => (o.orderNumber === orderNumber ? data.order : o)),
          );
        }
      }
    } catch {
      // Ignore transient error
    }
  };

  const orderStats = computeOrderStats(orders);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="لوحة إدارة المتجر"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-white/15 bg-[#110F11] text-[#FAF7F5] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#09090B] px-5 py-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <Lock className="h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
            <h2 className="truncate text-base font-bold sm:text-lg">
              لوحة إدارة Perfume 10
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-[#141214] px-3 text-xs font-semibold text-[#FAF7F5] transition-colors hover:border-[#DC2626] whitespace-nowrap cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>تسجيل الخروج</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق لوحة الإدارة"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#141214] text-[#A8A29E] transition-colors hover:border-[#DC2626] hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {!isAuthenticated ? (
            <div className="mx-auto max-w-md py-6">
              <div className="rounded-xl border border-white/10 bg-[#141214] p-6">
                <h3 className="text-xl font-bold text-[#FAF7F5]">
                  دخول المشرف
                </h3>
                <p className="mt-1.5 text-sm text-[#A8A29E]">
                  أدخل اسم المستخدم وكلمة المرور للوصول إلى إدارة المنتجات، إعدادات الواتساب والتوصيل، والطلبات.
                </p>

                <form
                  onSubmit={handleLoginSubmit}
                  noValidate
                  className="mt-6 space-y-4"
                >
                  <div>
                    <label
                      htmlFor="admin-username"
                      className="mb-1.5 block text-xs font-semibold text-[#FAF7F5]"
                    >
                      اسم المستخدم
                    </label>
                    <input
                      id="admin-username"
                      type="text"
                      dir="ltr"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="اسم المستخدم"
                      className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 py-2.5 text-left font-latin text-sm text-[#FAF7F5] placeholder:text-right placeholder:text-[#71717A] focus:border-[#DC2626] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="admin-password"
                      className="mb-1.5 block text-xs font-semibold text-[#FAF7F5]"
                    >
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        dir="ltr"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-white/15 bg-[#09090B] py-2.5 pl-11 pr-3.5 text-left font-latin text-sm text-[#FAF7F5] placeholder:text-[#71717A] focus:border-[#DC2626] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
                        }
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded text-[#A8A29E] hover:text-white cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <p role="alert" className="text-xs text-[#F87171]">
                      {loginError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#DC2626] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-60 cursor-pointer"
                  >
                    {isLoggingIn ? 'جاري التحقق...' : 'دخول إلى لوحة الإدارة'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Segmented Workspace Tabs */}
              <div
                role="tablist"
                aria-label="أقسام لوحة الإدارة"
                className="flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-[#09090B] p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'products'}
                  onClick={() => setActiveTab('products')}
                  className={`rounded-md px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'products'
                      ? 'bg-[#DC2626] text-white'
                      : 'text-[#A8A29E] hover:text-white'
                  }`}
                >
                  المنتجات ({products.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'settings'}
                  onClick={() => setActiveTab('settings')}
                  className={`rounded-md px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-[#DC2626] text-white'
                      : 'text-[#A8A29E] hover:text-white'
                  }`}
                >
                  الواتساب والتوصيل
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'orders'}
                  onClick={() => setActiveTab('orders')}
                  className={`rounded-md px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-[#DC2626] text-white'
                      : 'text-[#A8A29E] hover:text-white'
                  }`}
                >
                  سجل الطلبات
                </button>
              </div>

              {/* LocalStorage vs Live Site Note */}
              <div
                data-testid="admin-storage-note"
                className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-100"
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                <p>
                  <strong className="font-bold text-white">ملاحظة حول الحفظ (localStorage):</strong>{' '}
                  تُحفظ تعديلات المنتجات، الأسعار، رقم الواتساب ورسوم التوصيل في هذا المتصفح فقط. لإظهار هذه التغييرات لجميع الزوار على الموقع المباشر، يلزم ربط قاعدة بيانات/خادم مشترك أو تحديث بيانات المنتجات المخزنة في ملفات الموقع.
                </p>
              </div>

              {/* Tab 1: Products CRUD */}
              {activeTab === 'products' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  {/* Add / Edit Form */}
                  <div
                    ref={productFormCardRef}
                    data-testid="admin-product-form-card"
                    className={`rounded-xl border p-5 lg:col-span-5 transition-colors ${
                      editingId
                        ? 'border-[#DC2626]/60 bg-[#181113]'
                        : 'border-white/10 bg-[#141214]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#FAF7F5]">
                          {editingId ? 'تعديل المنتج' : 'إضافة عطر جديد'}
                        </h3>
                        {editingId && (
                          <span className="rounded bg-[#DC2626]/20 px-2 py-0.5 text-[11px] font-bold text-[#FCA5A5]">
                            وضع التعديل
                          </span>
                        )}
                      </div>
                    </div>

                    <form
                      onSubmit={handleSaveProduct}
                      data-mode={editingId ? 'edit' : 'add'}
                      noValidate
                      className="mt-4 space-y-3"
                    >
                      <div>
                        <label
                          htmlFor="prod-name"
                          className="mb-1 block text-xs font-medium text-[#A8A29E]"
                        >
                          اسم العطر
                        </label>
                        <input
                          ref={productNameInputRef}
                          id="prod-name"
                          type="text"
                          value={productForm.name}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="مثال: سوفاج ديور"
                          className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#FAF7F5] focus:border-[#DC2626] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="prod-price"
                            className="mb-1 block text-xs font-medium text-[#A8A29E]"
                          >
                            السعر (درهم)
                          </label>
                          <input
                            id="prod-price"
                            type="number"
                            min={1}
                            value={productForm.price}
                            onChange={(e) =>
                              setProductForm((prev) => ({
                                ...prev,
                                price: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#FAF7F5] tabular-nums focus:border-[#DC2626] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="prod-size"
                            className="mb-1 block text-xs font-medium text-[#A8A29E]"
                          >
                            الحجم / السعة
                          </label>
                          <input
                            id="prod-size"
                            type="text"
                            value={productForm.sizeLabel}
                            onChange={(e) =>
                              setProductForm((prev) => ({
                                ...prev,
                                sizeLabel: e.target.value,
                              }))
                            }
                            placeholder="10 مل"
                            className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#FAF7F5] focus:border-[#DC2626] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="prod-image"
                          className="block text-xs font-medium text-[#A8A29E]"
                        >
                          رابط أو مسار الصورة (اختياري)
                        </label>
                        <input
                          id="prod-image"
                          type="text"
                          dir="ltr"
                          value={
                            productForm.image.startsWith('data:image/')
                              ? ''
                              : productForm.image
                          }
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              image: e.target.value,
                            }))
                          }
                          placeholder={
                            productForm.image.startsWith('data:image/')
                              ? 'صورة مرفوعة من الجهاز (أو اكتب رابطاً للاستبدال)'
                              : '/assets/perfumes/aventus-card.png'
                          }
                          className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-left font-latin text-xs text-[#FAF7F5] placeholder:text-[#71717A] focus:border-[#DC2626] focus:outline-none"
                        />

                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            ref={imageFileInputRef}
                            id="prod-image-file"
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileSelect}
                            className="sr-only"
                          />
                          <button
                            type="button"
                            disabled={imageUploading}
                            onClick={() => imageFileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-xs font-semibold text-[#FAF7F5] transition-colors hover:border-[#DC2626] disabled:opacity-60 cursor-pointer"
                          >
                            <ImagePlus className="h-3.5 w-3.5 text-[#DC2626]" aria-hidden="true" />
                            <span>
                              {imageUploading
                                ? 'جاري معالجة الصورة...'
                                : 'رفع صورة من الجهاز'}
                            </span>
                          </button>

                          {productForm.image && (
                            <button
                              type="button"
                              onClick={handleClearProductImage}
                              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#09090B] px-2.5 py-2 text-xs text-[#A8A29E] transition-colors hover:border-[#DC2626] hover:text-white cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>إزالة الصورة</span>
                            </button>
                          )}
                        </div>

                        {productForm.image && (
                          <div
                            data-testid="product-image-preview"
                            className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#09090B] p-2.5"
                          >
                            {!previewError ? (
                              <img
                                src={productForm.image}
                                alt="معاينة صورة المنتج"
                                onError={() => setPreviewError(true)}
                                className="h-14 w-14 shrink-0 rounded-md border border-white/10 bg-[#141214] object-contain"
                              />
                            ) : (
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-red-500/30 bg-[#1B0C0E] text-[10px] text-red-300 text-center px-1">
                                تعذر العرض
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-[#FAF7F5]">
                                {productForm.image.startsWith('data:image/')
                                  ? 'تم رفع الصورة من الجهاز'
                                  : 'معاينة صورة المنتج'}
                              </p>
                              <p className="truncate text-[11px] text-[#71717A]" dir="ltr">
                                {productForm.image.startsWith('data:image/')
                                  ? 'محفوظة محلياً مع المنتج (Data URL)'
                                  : productForm.image}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="prod-desc"
                          className="mb-1 block text-xs font-medium text-[#A8A29E]"
                        >
                          الوصف
                        </label>
                        <textarea
                          id="prod-desc"
                          rows={2}
                          value={productForm.description}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="وصف مختصر لرائحة العطر وثباته..."
                          className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#FAF7F5] focus:border-[#DC2626] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-2.5 rounded-lg border border-white/10 bg-[#09090B]/70 p-3">
                        <p className="text-xs font-semibold text-[#FAF7F5]">
                          النوتات العطرية (اختياري — مفصولة بفاصلة)
                        </p>
                        <div>
                          <label
                            htmlFor="prod-top-notes"
                            className="mb-1 block text-[11px] font-medium text-[#A8A29E]"
                          >
                            الافتتاحية
                          </label>
                          <input
                            id="prod-top-notes"
                            type="text"
                            value={productForm.topNotes}
                            onChange={(e) =>
                              setProductForm((prev) => ({
                                ...prev,
                                topNotes: e.target.value,
                              }))
                            }
                            placeholder="مثال: الأناناس، البرغموت، التفاح"
                            className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-1.5 text-xs text-[#FAF7F5] focus:border-[#DC2626] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="prod-heart-notes"
                            className="mb-1 block text-[11px] font-medium text-[#A8A29E]"
                          >
                            قلب العطر
                          </label>
                          <input
                            id="prod-heart-notes"
                            type="text"
                            value={productForm.heartNotes}
                            onChange={(e) =>
                              setProductForm((prev) => ({
                                ...prev,
                                heartNotes: e.target.value,
                              }))
                            }
                            placeholder="مثال: خشب البتولا، الياسمين، الباتشولي"
                            className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-1.5 text-xs text-[#FAF7F5] focus:border-[#DC2626] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="prod-base-notes"
                            className="mb-1 block text-[11px] font-medium text-[#A8A29E]"
                          >
                            قاعدة العطر
                          </label>
                          <input
                            id="prod-base-notes"
                            type="text"
                            value={productForm.baseNotes}
                            onChange={(e) =>
                              setProductForm((prev) => ({
                                ...prev,
                                baseNotes: e.target.value,
                              }))
                            }
                            placeholder="مثال: المسك، العنبر، الفانيليا"
                            className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-1.5 text-xs text-[#FAF7F5] focus:border-[#DC2626] focus:outline-none"
                          />
                        </div>
                      </div>

                      {productError && (
                        <p role="alert" className="text-xs text-[#F87171]">
                          {productError}
                        </p>
                      )}

                      {productFeedback && (
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>{productFeedback}</span>
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="submit"
                          className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#B91C1C] cursor-pointer"
                        >
                          {editingId ? (
                            <Check className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Plus className="h-4 w-4" aria-hidden="true" />
                          )}
                          <span>
                            {editingId ? 'حفظ التعديل' : 'إضافة العطر للمتجر'}
                          </span>
                        </button>

                        {editingId && (
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-white/15 bg-[#09090B] px-4 py-2 text-xs font-semibold text-[#FAF7F5] transition-colors hover:border-white/30 cursor-pointer"
                          >
                            إلغاء
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Products List */}
                  <div className="space-y-3 lg:col-span-7">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-[#FAF7F5]">
                        المنتجات الحالية
                      </h3>
                      {!products.some((p) => p.id === 'creed-aventus') && (
                        <button
                          type="button"
                          onClick={handleRestoreAventus}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#DC2626]/50 bg-[#1B0C0E] px-3 py-1.5 text-xs font-bold text-[#FAF7F5] transition-colors hover:border-[#DC2626] cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5 text-[#DC2626]" aria-hidden="true" />
                          <span>استعادة كريد أفنتوس</span>
                        </button>
                      )}
                    </div>

                    {products.length === 0 ? (
                      <div className="rounded-xl border border-white/10 bg-[#141214] p-8 text-center">
                        <p className="text-sm text-[#A8A29E]">
                          لا توجد منتجات حالياً. أضف منتجاً جديداً أو استعد المنتجات الافتراضية من تبويب الإعدادات.
                        </p>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {products.map((perfume) => {
                          const isBeingEdited = editingId === perfume.id;
                          return (
                            <li
                              key={perfume.id}
                              data-testid={`admin-product-${perfume.id}`}
                              className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors ${
                                isBeingEdited
                                  ? 'border-[#DC2626] bg-[#1B0C0E]'
                                  : 'border-white/10 bg-[#141214]'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {perfume.image ? (
                                  <img
                                    src={perfume.image}
                                    alt={perfume.arabicName}
                                    className="h-14 w-14 shrink-0 rounded-lg border border-white/10 bg-[#09090B] object-contain"
                                  />
                                ) : (
                                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#09090B] text-xs font-bold text-[#DC2626]">
                                    {getProductSizeText(perfume)}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-bold text-[#FAF7F5]">
                                      {perfume.arabicName}
                                    </p>
                                    {isBeingEdited && (
                                      <span className="shrink-0 rounded bg-[#DC2626]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#FCA5A5]">
                                        قيد التعديل
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#A8A29E] tabular-nums">
                                    {getProductSizeText(perfume)} ·{' '}
                                    <span className="font-bold text-[#DC2626]">
                                      {perfume.priceMad} درهم
                                    </span>
                                  </p>
                                  <p className="mt-0.5 truncate text-xs text-[#71717A] max-w-xs">
                                    {perfume.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(perfume)}
                                  aria-label={`تعديل ${perfume.arabicName}`}
                                  className={`inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-xs font-semibold cursor-pointer transition-colors ${
                                    isBeingEdited
                                      ? 'border-[#DC2626] bg-[#DC2626] text-white'
                                      : 'border-white/15 bg-[#09090B] text-[#FAF7F5] hover:border-[#DC2626]'
                                  }`}
                                >
                                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>تعديل</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(perfume.id)}
                                  aria-label={`حذف ${perfume.arabicName}`}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#09090B] text-[#A8A29E] hover:border-[#DC2626] hover:text-[#DC2626] cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: WhatsApp & Delivery Fee Settings + Safe Reset */}
              {activeTab === 'settings' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <form
                    onSubmit={handleSaveSettings}
                    noValidate
                    className="space-y-4 rounded-xl border border-white/10 bg-[#141214] p-5 lg:col-span-7"
                  >
                    <h3 className="text-base font-bold text-[#FAF7F5]">
                      إعدادات الواتساب والتوصيل
                    </h3>

                    <div>
                      <label
                        htmlFor="admin-whatsapp"
                        className="mb-1 block text-xs font-medium text-[#A8A29E]"
                      >
                        رقم الواتساب لاستقبال الطلبات (بصيغة دولية بدون +)
                      </label>
                      <input
                        id="admin-whatsapp"
                        type="text"
                        dir="ltr"
                        value={whatsappInput}
                        onChange={(e) => {
                          setWhatsappInput(e.target.value);
                          setSettingsSaved(false);
                        }}
                        placeholder={DEFAULT_WHATSAPP_NUMBER}
                        className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 py-2.5 text-left font-latin text-sm text-[#FAF7F5] tabular-nums focus:border-[#DC2626] focus:outline-none"
                      />
                      <p className="mt-1 text-xs text-[#71717A]" dir="ltr">
                        https://wa.me/{normalizeWhatsAppNumber(whatsappInput) || DEFAULT_WHATSAPP_NUMBER}
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="admin-delivery-fee"
                        className="mb-1 block text-xs font-medium text-[#A8A29E]"
                      >
                        رسوم التوصيل (درهم)
                      </label>
                      <input
                        id="admin-delivery-fee"
                        type="number"
                        min={0}
                        value={deliveryInput}
                        onChange={(e) => {
                          setDeliveryInput(e.target.value);
                          setSettingsSaved(false);
                        }}
                        placeholder={String(DEFAULT_DELIVERY_FEE_MAD)}
                        className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 py-2.5 text-sm text-[#FAF7F5] tabular-nums focus:border-[#DC2626] focus:outline-none"
                      />
                    </div>

                    {settingsError && (
                      <p role="alert" className="text-xs text-[#F87171]">
                        {settingsError}
                      </p>
                    )}

                    {settingsSaved && (
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>تم حفظ الإعدادات في المتصفح بنجاح.</span>
                      </p>
                    )}

                    <button
                      type="submit"
                      className="flex min-h-[42px] w-full sm:w-auto items-center justify-center rounded-lg bg-[#DC2626] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#B91C1C] cursor-pointer"
                    >
                      حفظ الإعدادات
                    </button>
                  </form>

                  {/* Safe Reset to Default Card */}
                  <div className="rounded-xl border border-white/10 bg-[#141214] p-5 lg:col-span-5">
                    <h3 className="text-base font-bold text-[#FAF7F5]">
                      استعادة الإعدادات الافتراضية
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#A8A29E]">
                      في حال أردت الرجوع إلى العطور الثلاثة الأصلية، رقم الواتساب الافتراضي ({DEFAULT_WHATSAPP_NUMBER})، ورسوم التوصيل ({DEFAULT_DELIVERY_FEE_MAD} درهم).
                    </p>

                    {!confirmResetOpen ? (
                      <button
                        type="button"
                        onClick={() => setConfirmResetOpen(true)}
                        className="mt-5 inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg border border-[#DC2626]/50 bg-[#1B0C0E] px-4 py-2 text-xs font-bold text-[#FAF7F5] transition-colors hover:border-[#DC2626] cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>استعادة الإعدادات الافتراضية</span>
                      </button>
                    ) : (
                      <div className="mt-4 space-y-3 rounded-lg border border-[#DC2626]/40 bg-[#09090B] p-4">
                        <p className="text-xs font-semibold text-[#FAF7F5]">
                          هل أنت متأكد من استعادة البيانات الافتراضية؟
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleConfirmReset}
                            className="flex-1 rounded-lg bg-[#DC2626] px-3 py-2 text-xs font-bold text-white hover:bg-[#B91C1C] cursor-pointer"
                          >
                            نعم، استعادة
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmResetOpen(false)}
                            className="flex-1 rounded-lg border border-white/15 bg-[#141214] px-3 py-2 text-xs font-semibold text-[#A8A29E] hover:text-white cursor-pointer"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Live Server Orders */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-6 text-xs text-[#A8A29E]">
                      <span>
                        إجمالي الطلبات:{' '}
                        <strong className="text-[#FAF7F5] tabular-nums">
                          {orderStats.totalOrders}
                        </strong>
                      </span>
                      <span>
                        الطلبات الجديدة:{' '}
                        <strong className="text-amber-300 tabular-nums">
                          {orderStats.newOrders}
                        </strong>
                      </span>
                      <span>
                        المجموع:{' '}
                        <strong className="text-[#DC2626] tabular-nums">
                          {orderStats.totalRevenueMad} درهم
                        </strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={fetchOrders}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/15 bg-[#09090B] px-3 text-xs font-semibold text-[#FAF7F5] hover:border-[#DC2626] cursor-pointer"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${ordersLoading ? 'animate-spin' : ''}`}
                        aria-hidden="true"
                      />
                      <span>تحديث</span>
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-[#141214] p-8 text-center text-sm text-[#A8A29E]">
                      {ordersLoading
                        ? 'جاري تحميل الطلبات...'
                        : 'لا توجد طلبات مسجلة حتى الآن.'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#141214]">
                      <table className="w-full border-collapse text-right text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-white/10 bg-[#09090B] text-xs text-[#A8A29E]">
                            <th className="px-4 py-3">الطلب</th>
                            <th className="px-4 py-3">الزبون</th>
                            <th className="px-4 py-3">العنوان</th>
                            <th className="px-4 py-3">المنتجات</th>
                            <th className="px-4 py-3">الإجمالي</th>
                            <th className="px-4 py-3">الحالة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {orders.map((order) => {
                            const meta = ORDER_STATUS_META[order.status];
                            return (
                              <tr key={order.orderNumber}>
                                <td className="px-4 py-3 font-latin font-bold tabular-nums whitespace-nowrap">
                                  <span dir="ltr" className="inline-block">
                                    #{order.orderNumber}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="font-semibold">{order.customer.fullName}</p>
                                  <p dir="ltr" className="inline-block text-xs text-[#A8A29E] tabular-nums">
                                    {order.customer.phone}
                                  </p>
                                </td>
                                <td className="px-4 py-3 text-xs text-[#A8A29E]">
                                  {order.customer.city} — {order.customer.address}
                                </td>
                                <td className="px-4 py-3 text-xs">
                                  {order.items
                                    .map((i) => `${i.arabicName} × ${i.quantity}`)
                                    .join(' · ')}
                                </td>
                                <td className="px-4 py-3 font-bold text-[#DC2626] tabular-nums whitespace-nowrap">
                                  {order.totalMad} درهم
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <select
                                    aria-label={`تغيير حالة الطلب ${order.orderNumber}`}
                                    value={order.status}
                                    onChange={(e) =>
                                      handleStatusChange(
                                        order.orderNumber,
                                        e.target.value as OrderStatus,
                                      )
                                    }
                                    className={`rounded-md border px-2 py-1 text-xs font-semibold bg-[#09090B] ${meta.badgeClass}`}
                                  >
                                    <option value="new">طلب جديد</option>
                                    <option value="delivering">قيد التوصيل</option>
                                    <option value="delivered">تم التوصيل</option>
                                    <option value="cancelled">ملغى</option>
                                  </select>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
