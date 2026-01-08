"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBuyerOrderDetails } from "@/lib/ordersApi";
import { useEffect, useState } from "react";
import OrderDetailsStoreSection from "./_components/OrderDetailsStoreSection";
import ChatTab from "./_components/OrderChatTab";
import OrderStatusTab from "./_components/OrderStatusTab";

export default function OrderDetails({ orderId, handleUpdate, loading }) {
  const [orders, setOrder] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [messages, setMessages] = useState([]);

  const fetchOrder = async () => {
    setFetching(true);
    try {
      const res = await getBuyerOrderDetails(orderId);
      setOrder(res.store_orders);
      setFetching(false);
    } catch (error) {
      console.error(error);
    }
  };
  const refreshOrder = async () => {
    try {
      const res = await getBuyerOrderDetails(orderId);
      setOrder(res.store_orders);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if(!orderId){
      return;
    }
    fetchOrder();
  }, [orderId]);
  return (
    <Card className="rounded-2xl shadow-none w-full">
      <CardContent className="px-6">
        <Tabs defaultValue="details" className="flex-1 flex flex-col">
          <TabsList className="gap-4 px-2 py-2 bg-muted/20 w-fit">
            <TabsTrigger value="details" className="py-2">
              Details
            </TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          <div className="flex-1">
            {!(orderId == null) ? (
              <>
                <TabsContent value="details">
                  {fetching ? (
                    <p>fetching..</p>
                  ) : (
                    <>
                      {" "}
                      {orders.map((sto) => (
                        <OrderDetailsStoreSection
                          storeOrder={sto}
                          key={sto.id}
                          handleUpdate={handleUpdate}
                          refresh={refreshOrder}
                        />
                      ))}
                    </>
                  )}
                </TabsContent>
                <TabsContent value="status">
                  <OrderStatusTab orders={orders} />
                </TabsContent>
                <TabsContent value="chat">
                  <ChatTab orders={orders} />
                </TabsContent>
              </>
            ) : (
              <p className="text-center p-4 text-muted-foreground">Select an order to view details</p>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
