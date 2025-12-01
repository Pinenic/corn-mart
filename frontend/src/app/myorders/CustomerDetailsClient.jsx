"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBuyerOrderDetails } from "@/lib/ordersApi";
import { useEffect, useState } from "react";
import OrderDetailsStoreSection from "./_components/OrderDetailsStoreSection";

export default function CustomerDetails({ orderId, loading }) {
  const [order, setOrder] = useState({});
  const [fetching, setFetching] = useState(false);

  const fetchOrder = async () => {
    setFetching(true);
    try {
      const res = await getBuyerOrderDetails(orderId);
      setOrder(res);
      setFetching(false);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(()=>{
    fetchOrder();
  },[orderId])
  return (
    <Card className="rounded-2xl shadow-none w-full">
      <CardContent className="p-6">
        <Tabs defaultValue="details" className="flex-1 flex flex-col">
          <TabsList className="gap-4 px-2 py-2 bg-muted/20 w-fit">
            <TabsTrigger value="details" className="py-2">
              Details
            </TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          <div className="flex-1">
            {!(orderId == null) ? ( <>
            <TabsContent value="details">
              {fetching ? <p>fetching..</p> : (<> {order?.store_orders.map((sto) => <OrderDetailsStoreSection storeOrder={sto} key={sto.id} />)}</>)}
            </TabsContent>
            <TabsContent value="status">
              <p>status tab</p>
            </TabsContent></>) : (<p>No selected order</p>)}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
