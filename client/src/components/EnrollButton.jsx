import { useState } from "react";
import {
  createPaymentOrder,
  verifyPayment,
} from "../services/paymentService";

function EnrollButton({ courseId }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleEnroll = async () => {
    try {
      setLoading(true);
      setMessage("");

      // Step 1: Create payment order
      const orderData = await createPaymentOrder(courseId);

      if (!orderData.success) {
        throw new Error("Unable to create payment order");
      }

      // Step 2: Check Razorpay Checkout availability
      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout could not be loaded");
      }

      // Step 3: Configure Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "SkillNest",
        description: "Course Enrollment",
        order_id: orderData.order.id,

        handler: async function (response) {
          try {
            // Step 4: Verify payment on backend
            const verification = await verifyPayment({
              courseId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verification.success) {
              setMessage("Payment successful! You are now enrolled.");
            } else {
              setMessage("Payment verification failed.");
            }
          } catch (error) {
            setMessage(
              error.response?.data?.message ||
                "Payment verification failed."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
            setMessage("Payment was cancelled.");
          },
        },

        theme: {
          color: "#6C5CE7",
        },
      };

      // Step 5: Open checkout
      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", function () {
        setLoading(false);
        setMessage("Payment failed. Please try again.");
      });

      checkout.open();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong."
      );
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleEnroll} disabled={loading}>
        {loading ? "Processing..." : "Enroll Now"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default EnrollButton;