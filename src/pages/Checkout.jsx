// PLACE ORDER
const placeOrder =
  async () => {

    if (
      !deliveryAvailable
    ) {

      toast.error(
        "Delivery unavailable in your area"
      );

      return;

    }

    if (
      !customerInfo.name ||
      !customerInfo.phone ||
      !customerInfo.address ||
      !customerInfo.city ||
      !customerInfo.pincode
    ) {

      toast.error(
        "Please fill all required fields"
      );

      return;

    }

    try {

      setLoading(true);

      // =========================
      // CASH ON DELIVERY
      // =========================
      if (
        paymentMethod ===
        "Cash on Delivery"
      ) {

        // SAVE ORDER
        const orderId =
          await saveOrder();

        // CLEAR CART PROPERLY
        await new Promise(
          (resolve) => {

            clearCart();

            localStorage.removeItem(
              "grocery-cart"
            );

            setTimeout(
              resolve,
              500
            );

          }
        );

        // SUCCESS MESSAGE
        toast.success(
          "Thank you for shopping with us ❤️"
        );

        // OPEN WHATSAPP
        setTimeout(() => {

          sendWhatsAppMessage(
            orderId
          );

        }, 700);

        // REDIRECT HOME
        setTimeout(() => {

          window.location.href =
            "/";

        }, 2500);

      }

      // =========================
      // ONLINE PAYMENT
      // =========================
      else {

        const response =
          await axios.post(

            `${import.meta.env.VITE_BACKEND_URL}/create-order`,

            {

              amount:
                finalTotal,

            }
          );

        const order =
          response.data.order;

        const options = {

          key:
            import.meta.env
              .VITE_RAZORPAY_KEY_ID,

          amount:
            order.amount,

          currency:
            order.currency,

          name:
            "GroceryHub",

          description:
            "Order Payment",

          order_id:
            order.id,

          handler:
            async () => {

              try {

                // SAVE ORDER
                const orderId =
                  await saveOrder();

                // CLEAR CART
                await new Promise(
                  (
                    resolve
                  ) => {

                    clearCart();

                    localStorage.removeItem(
                      "grocery-cart"
                    );

                    setTimeout(
                      resolve,
                      500
                    );

                  }
                );

                // SUCCESS
                toast.success(
                  "Thank you for shopping with us ❤️"
                );

                // OPEN WHATSAPP
                setTimeout(() => {

                  sendWhatsAppMessage(
                    orderId
                  );

                }, 700);

                // REDIRECT
                setTimeout(() => {

                  window.location.href =
                    "/";

                }, 2500);

              } catch (error) {

                console.error(
                  error
                );

                toast.error(
                  "Payment succeeded but order saving failed"
                );

              }

            },

          prefill: {

            name:
              customerInfo.name,

            contact:
              customerInfo.phone,

          },

          theme: {

            color:
              "#16a34a",

          },

        };

        const razorpay =
          new window.Razorpay(
            options
          );

        razorpay.open();

      }

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to place order"
      );

    } finally {

      setLoading(false);

    }

  };