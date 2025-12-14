// backend/routes/checkout.js
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabaseClient.js";
import { requestToPay } from "../utils/momoCollections.js";

export const createCheckout = async (buyerId, items, payerNumber) => {
  try {
    const now = new Date();
    const expiry = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes later

    // 1️⃣ Create a reservation entry in DB
    const { data: reservation, error: Reserror } = await supabase
      .from("reservations")
      .insert([
        {
          buyer_id: buyerId,
          status: "reserved",
          total_amount: items
            .reduce((acc, i) => acc + i.unit_price * i.quantity, 0)
            .toFixed(2),
        },
      ])
      .select()
      .single();
    Reserror ? console.log(Reserror) : console.log(reservation);
    const reservationId = reservation.id;
    // Optionally, insert reservation_items
    const reservationItems = items.map((item) => ({
      reservation_id: reservationId,
      product_id: item.id,
      store_id: item.store_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    await supabase.from("reservation_items").insert(reservationItems);

    // 2️⃣ Initiate MoMo request-to-pay
    const payload = {
      amount: items
        .reduce((acc, i) => acc + i.unit_price * i.quantity, 0)
        .toFixed(2),
      currency: "ZMW",
      externalId: reservationId,
      payer: { partyIdType: "MSISDN", partyId: payerNumber },
      payerMessage: "Xoo Store purchase",
      payeeNote: "Thank you for shopping with Xoo Store",
    };
    const {referenceId, response} = await requestToPay({
      amount: payload.amount,
      phone: payload.payer.partyId,
      externalId: payload.externalId,
      payerMessage: payload.payerMessage,
      payeeNote: payload.payeeNote,
    });

    console.log(referenceId);
    // console.log(response)

    // const momoResponse = await axios.post(
    //   "https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay",
    //   {
    //     amount: items
    //       .reduce((acc, i) => acc + i.price * i.quantity, 0)
    //       .toFixed(2),
    //     currency: "ZMW",
    //     externalId: reservationId,
    //     payer: { partyIdType: "MSISDN", partyId: req.body.payerNumber },
    //     payerMessage: "Xoo Store purchase",
    //     payeeNote: "Thank you for shopping with Xoo Store",
    //   },
    //   {
    //     headers: {
    //       Authorization: `Bearer ${process.env.MOMO_BEARER_TOKEN}`,
    //       "X-Reference-Id": referenceId,
    //       "X-Target-Environment": "sandbox",
    //       "Ocp-Apim-Subscription-Key": process.env.MOMO_SUBSCRIPTION_KEY,
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );

    // 3️⃣ Insert payment entry as pending
    const { error } = await supabase.from("payments").insert([
      {
        order_id: null,
        amount: items
          .reduce((acc, i) => acc + i.unit_price * i.quantity, 0)
          .toFixed(2),
        currency: "ZMW",
        platform_fee: (items
          .reduce((acc, i) => acc + i.unit_price * i.quantity, 0)
          .toFixed(2)) * 0.1,
        status: "pending",
        momo_reference_id: referenceId,
        reservation_id: reservationId,
        momo_external_id: reservationId,
      },
    ]);

    if (error) return error;

    return {
      reservationId,
      paymentStatus: "pending",
      message: "Payment request sent. Waiting for confirmation.",
    };
  } catch (err) {
    console.error("Checkout error:", err);
    return { message: "Checkout failed", error: err.message };
  }
};
