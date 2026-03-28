"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCart } from "@/context/CartContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PayPalButton } from "@/components/checkout/PayPalButton";

type CheckoutStep = "info" | "shipping" | "payment" | "confirmation";

export default function CheckoutPage() {
  const { items, total, clearCart, itemCount } = useCart();
  const locale = useLocale();
  const router = useRouter();
  const isEs = locale === "es";

  const [step, setStep] = useState<CheckoutStep>("info");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingName, setShippingName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingZip, setShippingZip] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState<{ type: string; value: number; code: string } | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const discountAmount = discountApplied
    ? discountApplied.type === "percentage"
      ? Math.round(total * (discountApplied.value / 100))
      : discountApplied.value
    : 0;

  const finalTotal = Math.max(0, total - discountAmount);

  if (itemCount === 0 && !orderId) {
    return (
      <section className="py-20">
        <Container narrow>
          <div className="text-center">
            <h1 className="font-heading text-heading text-2xl font-bold mb-4">
              {isEs ? "Tu carrito está vacío" : "Your cart is empty"}
            </h1>
            <Button href={`/${locale}/programs`} size="lg">
              {isEs ? "Ver Programas" : "Browse Programs"}
            </Button>
          </div>
        </Container>
      </section>
    );
  }

  async function applyDiscount() {
    if (!discountCode.trim()) return;
    setDiscountError("");

    try {
      const res = await fetch(`/api/discount?code=${encodeURIComponent(discountCode.trim())}`);
      const data = await res.json();

      if (data.valid) {
        if (data.minOrderValue && total < data.minOrderValue) {
          setDiscountError(
            isEs
              ? `Mínimo de pedido: ${formatPrice(data.minOrderValue)}`
              : `Minimum order: ${formatPrice(data.minOrderValue)}`
          );
          return;
        }
        setDiscountApplied({ type: data.type, value: data.value, code: data.code });
      } else {
        setDiscountError(isEs ? "Código inválido" : "Invalid code");
      }
    } catch {
      setDiscountError(isEs ? "Error al verificar" : "Error checking code");
    }
  }

  async function handlePlaceOrder() {
    setProcessing(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone: phone || null,
          subtotal: total,
          discount: discountAmount,
          total: finalTotal,
          discountCode: discountApplied?.code || null,
          shippingName,
          shippingAddress,
          shippingCity,
          shippingState,
          shippingZip,
          locale,
          items: items.map((item) => ({
            name: item.name,
            variantLabel: item.variantLabel,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderId(data.orderId);
        setStep("confirmation");
        clearCart();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  }

  // Step indicator
  const steps = [
    { key: "info", label: isEs ? "Info" : "Info" },
    { key: "shipping", label: isEs ? "Envío" : "Shipping" },
    { key: "payment", label: isEs ? "Pago" : "Payment" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <>
      {/* Progress */}
      {step !== "confirmation" && (
        <div className="bg-surface-dim border-b border-border py-4">
          <Container>
            <div className="flex items-center justify-center gap-8">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i <= currentStepIndex
                        ? "bg-brand-red text-white"
                        : "bg-border text-body-muted"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      i <= currentStepIndex ? "text-heading" : "text-body-muted"
                    }`}
                  >
                    {s.label}
                  </span>
                  {i < steps.length - 1 && (
                    <div className={`w-12 h-0.5 ml-2 ${i < currentStepIndex ? "bg-brand-red" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
          </Container>
        </div>
      )}

      <section className="py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Step 1: Contact Info */}
              {step === "info" && (
                <div>
                  <h2 className="font-heading text-heading text-2xl font-bold mb-6">
                    {isEs ? "Información de Contacto" : "Contact Information"}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-heading mb-2">Email *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-card border border-border focus:border-brand-red focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-heading mb-2">
                        {isEs ? "Teléfono (opcional)" : "Phone (optional)"}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-card border border-border focus:border-brand-red focus:outline-none transition-colors"
                      />
                    </div>
                    <button
                      onClick={() => email.includes("@") && setStep("shipping")}
                      className="bg-brand-red text-white font-heading font-semibold px-8 py-3.5 rounded-pill shadow-btn hover:bg-brand-red-hover transition-all duration-base"
                    >
                      {isEs ? "Continuar al Envío →" : "Continue to Shipping →"}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping */}
              {step === "shipping" && (
                <div>
                  <h2 className="font-heading text-heading text-2xl font-bold mb-6">
                    {isEs ? "Dirección de Envío" : "Shipping Address"}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-heading mb-2">
                        {isEs ? "Nombre Completo" : "Full Name"} *
                      </label>
                      <input
                        type="text"
                        value={shippingName}
                        onChange={(e) => setShippingName(e.target.value)}
                        className="w-full px-4 py-3 rounded-card border border-border focus:border-brand-red focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-heading mb-2">
                        {isEs ? "Dirección" : "Address"} *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="w-full px-4 py-3 rounded-card border border-border focus:border-brand-red focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-heading mb-2">
                          {isEs ? "Ciudad" : "City"} *
                        </label>
                        <input
                          type="text"
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          className="w-full px-4 py-3 rounded-card border border-border focus:border-brand-red focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-heading mb-2">
                          {isEs ? "Estado" : "State"} *
                        </label>
                        <input
                          type="text"
                          value={shippingState}
                          onChange={(e) => setShippingState(e.target.value)}
                          className="w-full px-4 py-3 rounded-card border border-border focus:border-brand-red focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-heading mb-2">ZIP *</label>
                        <input
                          type="text"
                          value={shippingZip}
                          onChange={(e) => setShippingZip(e.target.value)}
                          className="w-full px-4 py-3 rounded-card border border-border focus:border-brand-red focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep("info")}
                        className="text-body-muted hover:text-brand-red transition-colors"
                      >
                        ← {isEs ? "Atrás" : "Back"}
                      </button>
                      <button
                        onClick={() => shippingName && shippingAddress && shippingCity && shippingState && shippingZip && setStep("payment")}
                        className="bg-brand-red text-white font-heading font-semibold px-8 py-3.5 rounded-pill shadow-btn hover:bg-brand-red-hover transition-all duration-base"
                      >
                        {isEs ? "Continuar al Pago →" : "Continue to Payment →"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === "payment" && (
                <div>
                  <h2 className="font-heading text-heading text-2xl font-bold mb-6">
                    {isEs ? "Pago" : "Payment"}
                  </h2>

                  {/* Discount Code */}
                  <div className="mb-8 p-4 rounded-card border border-border">
                    <label className="block text-sm font-medium text-heading mb-2">
                      {isEs ? "Código de Descuento" : "Discount Code"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        placeholder={isEs ? "Ingresa tu código" : "Enter your code"}
                        className="flex-grow px-4 py-3 rounded-card border border-border focus:border-brand-red focus:outline-none transition-colors"
                        disabled={!!discountApplied}
                      />
                      {!discountApplied ? (
                        <button
                          onClick={applyDiscount}
                          className="px-6 py-3 rounded-card border border-brand-red text-brand-red font-semibold hover:bg-brand-red hover:text-white transition-all"
                        >
                          {isEs ? "Aplicar" : "Apply"}
                        </button>
                      ) : (
                        <button
                          onClick={() => { setDiscountApplied(null); setDiscountCode(""); }}
                          className="px-6 py-3 rounded-card border border-border text-body-muted hover:text-error transition-colors"
                        >
                          {isEs ? "Quitar" : "Remove"}
                        </button>
                      )}
                    </div>
                    {discountError && <p className="text-error text-sm mt-1">{discountError}</p>}
                    {discountApplied && (
                      <p className="text-success text-sm mt-1">
                        ✓ {discountApplied.code} — {isEs ? "Ahorro" : "Saving"} {formatPrice(discountAmount)}
                      </p>
                    )}
                  </div>

                  {/* PayPal Payment */}
                  <div className="mb-6">
                    <PayPalButton
                      amount={finalTotal}
                      discountCode={discountApplied?.code}
                      disabled={processing}
                      onApprove={async (paypalOrderId) => {
                        setProcessing(true);
                        try {
                          const res = await fetch("/api/paypal/capture-order", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              paypalOrderId,
                              email,
                              phone: phone || null,
                              subtotal: total,
                              discountAmount,
                              finalTotal,
                              discountCode: discountApplied?.code || null,
                              shippingName,
                              shippingAddress,
                              shippingCity,
                              shippingState,
                              shippingZip,
                              locale,
                              items: items.map((item) => ({
                                name: item.name,
                                variantLabel: item.variantLabel,
                                sku: item.variantId,
                                price: item.price,
                                quantity: item.quantity,
                              })),
                            }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            setOrderId(data.orderId);
                            setStep("confirmation");
                            clearCart();
                          } else {
                            alert(isEs ? "Error al procesar el pago. Contacta soporte." : "Payment processing error. Please contact support.");
                          }
                        } catch (error) {
                          console.error(error);
                          alert(isEs ? "Error inesperado. Intenta de nuevo." : "Unexpected error. Please try again.");
                        } finally {
                          setProcessing(false);
                        }
                      }}
                      onError={() => {
                        alert(isEs ? "Error con PayPal. Intenta de nuevo." : "PayPal error. Please try again.");
                      }}
                    />
                  </div>

                  <button
                    onClick={() => setStep("shipping")}
                    className="text-body-muted hover:text-brand-red transition-colors"
                  >
                    ← {isEs ? "Atrás" : "Back"}
                  </button>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {step === "confirmation" && orderId && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-success-soft rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="font-heading text-heading text-3xl font-bold mb-4">
                    {isEs ? "¡Pedido Confirmado!" : "Order Confirmed!"}
                  </h2>
                  <p className="text-body-muted text-lg mb-2">
                    {isEs ? "Número de pedido:" : "Order number:"}{" "}
                    <span className="font-mono text-heading font-medium">{orderId}</span>
                  </p>
                  <p className="text-body-muted mb-8">
                    {isEs
                      ? "Recibirás un email de confirmación en breve."
                      : "You'll receive a confirmation email shortly."}
                  </p>

                  <div className="bg-brand-pink-soft rounded-card p-6 max-w-md mx-auto mb-8">
                    <h3 className="font-heading text-heading font-bold mb-2">
                      {isEs ? "Próximo Paso" : "Next Step"}
                    </h3>
                    <p className="text-body text-sm mb-4">
                      {isEs
                        ? "Completa tu formulario de ingreso médico para que nuestro equipo pueda revisar tu caso."
                        : "Complete your medical intake form so our team can review your case."}
                    </p>
                    <Button href="https://glow.bodygoodstudio.com" size="md">
                      {isEs ? "Completar Formulario Médico →" : "Complete Medical Intake →"}
                    </Button>
                  </div>

                  <Button href={`/${locale}/programs`} variant="outline" size="md">
                    {isEs ? "Explorar Más Programas" : "Explore More Programs"}
                  </Button>
                </div>
              )}
            </div>

            {/* Order sidebar */}
            {step !== "confirmation" && (
              <div className="bg-surface-dim rounded-card p-6 h-fit sticky top-20">
                <h3 className="font-heading text-heading text-lg font-bold mb-4">
                  {isEs ? "Tu Pedido" : "Your Order"}
                </h3>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex justify-between text-sm">
                      <div>
                        <p className="text-heading font-medium">{item.name}</p>
                        <p className="text-body-muted text-xs">{item.variantLabel}</p>
                      </div>
                      <p className="text-heading font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-body-muted">Subtotal</span>
                    <span className="text-heading">{formatPrice(total)}</span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between text-sm">
                      <span className="text-success">{isEs ? "Descuento" : "Discount"}</span>
                      <span className="text-success">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-heading font-bold text-heading pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-xl">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
