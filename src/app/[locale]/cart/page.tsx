"use client";

import { useCart } from "@/context/CartContext";
import { useLocale } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Truck } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();
  const locale = useLocale();
  const isEs = locale === "es";

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const hasSupplements = items.some((i) => i.productType === "supplement");
  const hasMixedTypes =
    hasSupplements && items.some((i) => i.productType !== "supplement");

  if (itemCount === 0) {
    return (
      <section className="py-20">
        <Container narrow>
          <div className="text-center">
            <div className="w-20 h-20 bg-surface-dim rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-body-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <h1 className="font-heading text-heading text-2xl font-bold mb-4">
              {isEs ? "Tu carrito está vacío" : "Your cart is empty"}
            </h1>
            <p className="text-body-muted mb-8">
              {isEs ? "Explora nuestros programas para comenzar." : "Explore our programs to get started."}
            </p>
            <Button href={`/${locale}/programs`} size="lg">
              {isEs ? "Ver Programas" : "Browse Programs"}
            </Button>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <>
      <section className="py-8 bg-brand-pink-soft">
        <Container>
          <h1 className="font-heading text-heading text-3xl font-bold">
            {isEs ? "Tu Carrito" : "Your Cart"}{" "}
            <span className="text-body-muted text-lg font-normal">
              ({itemCount} {itemCount === 1 ? (isEs ? "artículo" : "item") : (isEs ? "artículos" : "items")})
            </span>
          </h1>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          {hasMixedTypes && (
            <div className="flex items-start gap-3 p-4 mb-6 bg-blue-50 border border-blue-200 rounded-card text-sm text-blue-800">
              <Truck className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                {isEs
                  ? "Tu carrito contiene medicamentos Rx y suplementos. Los suplementos se enviarán por separado desde nuestro almacén."
                  : "Your cart contains Rx medications and supplements. Supplements will ship separately from our warehouse."}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center justify-between p-4 rounded-card border border-border"
                >
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="font-heading text-heading font-semibold">{item.name}</h3>
                      {item.productType === "supplement" && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          <Truck className="w-3 h-3" />
                          {isEs ? "Envío separado" : "Ships separately"}
                        </span>
                      )}
                    </div>
                    <p className="text-body-muted text-sm">{item.variantLabel}</p>
                    <p className="font-heading text-heading font-bold mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-border rounded-card">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="px-3 py-1 text-body-muted hover:text-heading transition-colors"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 font-medium text-heading">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="px-3 py-1 text-body-muted hover:text-heading transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-body-muted hover:text-error transition-colors text-sm"
                    >
                      {isEs ? "Eliminar" : "Remove"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-surface-dim rounded-card p-6 h-fit sticky top-20">
              <h2 className="font-heading text-heading text-xl font-bold mb-4">
                {isEs ? "Resumen del Pedido" : "Order Summary"}
              </h2>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.variantId} className="flex justify-between text-sm">
                    <span className="text-body-muted">
                      {item.name} x{item.quantity}
                      {item.productType === "supplement" && (
                        <span className="ml-1 text-xs text-blue-600">
                          {isEs ? "(sep.)" : "(sep.)"}
                        </span>
                      )}
                    </span>
                    <span className="text-heading font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 mb-4">
                <div className="flex justify-between">
                  <span className="font-heading text-heading font-bold">Total</span>
                  <span className="font-heading text-heading text-xl font-bold">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
              {hasSupplements && (
                <p className="text-xs text-body-muted mb-4 flex items-start gap-1">
                  <Truck className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {isEs
                    ? "Los suplementos se envían por separado."
                    : "Supplements ship separately."}
                </p>
              )}
              <Button href={`/${locale}/checkout`} size="lg" className="w-full">
                {isEs ? "Proceder al Pago" : "Proceed to Checkout"}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
