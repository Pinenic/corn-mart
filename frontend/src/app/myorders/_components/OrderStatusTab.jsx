"use client";

import OrderStatusTimeline from "./OrderStatusTimeline";

export default function OrderStatusTab({ orders }) {
  return (
    <div className="flex flex-col w-full h-full">
      {orders.map((sto) => (
        <div>
          {sto.history.length > 0 ? (
            <>
              <p className="mb-2">{sto.stores.name}</p>
              <OrderStatusTimeline history={sto.history} />
            </>
          ) : (
            <p>This order has no history</p>
          )}
        </div>
      ))}
    </div>
  );
}
