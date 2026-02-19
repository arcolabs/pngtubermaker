"use client";

import { Coins } from "lucide-react";

interface TopUpPackagesProps {
  onPurchase: (credits: number, price: number) => void;
  isLoading?: boolean;
}

const TOP_UP_PACKAGES = [
  {
    name: "Starter",
    credits: 5000,
    price: 5,
    bonus: 0,
  },
  {
    name: "Value",
    credits: 12000,
    price: 10,
    bonus: 20,
  },
  {
    name: "Power",
    credits: 35000,
    price: 25,
    bonus: 40,
  },
];

export default function TopUpPackages({
  onPurchase,
  isLoading = false,
}: TopUpPackagesProps) {
  return (
    <section className="py-16 bg-base-200/50">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Need More Credits?</h2>
          <p className="text-base-content/60">
            Credits purchased never expire. Top up anytime.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TOP_UP_PACKAGES.map((pkg) => (
            <div
              key={pkg.name}
              className="card bg-base-200 border border-base-content/10 hover:border-primary/30 transition-colors"
            >
              <div className="card-body items-center text-center">
                <h3 className="card-title">{pkg.name}</h3>
                <div className="flex items-center gap-2 my-2">
                  <Coins className="w-6 h-6 text-primary" />
                  <span className="text-3xl font-bold">
                    {pkg.credits.toLocaleString()}
                  </span>
                </div>
                <p className="text-2xl font-bold text-primary">${pkg.price}</p>
                {pkg.bonus > 0 && (
                  <span className="badge badge-primary badge-outline">
                    +{pkg.bonus}% bonus
                  </span>
                )}
                <button
                  type="button"
                  className="btn btn-outline btn-primary mt-4"
                  disabled={isLoading}
                  onClick={() => onPurchase(pkg.credits, pkg.price)}
                >
                  {isLoading ? "Loading..." : "Buy"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-base-content/50 mt-8">
          Credits purchased never expire.
        </p>
      </div>
    </section>
  );
}
