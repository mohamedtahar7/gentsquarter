import { z } from "zod";

const algerianPhoneRegex = /^(05|06|07)\d{8}$/;

export const checkoutSchema = z
  .object({
    customerName: z
      .string()
      .min(3, "Name must be at least 3 characters long")
      .max(100, "Name is too long"),

    phone: z
      .string()
      .regex(
        algerianPhoneRegex,
        "Enter a valid Algerian mobile number (05/06/07 followed by 8 digits)",
      ),

    deliveryType: z.enum(["HOME", "STOP_DESK"], {
      required_error: "Please select a delivery type",
    }),

    address: z
      .string()
      .max(255, "Address is too long")
      .optional()
      .or(z.literal("")), // Allows empty strings safely

    wilayaId: z.coerce
      .number()
      .int()
      .min(1, "Please select a Wilaya")
      .max(69, "Invalid Wilaya selection"),

    communeId: z.coerce.number().int().min(1, "Please select a Commune"),
  })
  .refine(
    (data) => {
      // Custom rule: If it's home delivery, an address is absolutely mandatory
      if (
        data.deliveryType === "HOME" &&
        (!data.address || data.address.trim().length < 5)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Please provide a valid street address for home delivery",
      path: ["address"], // Highlights the address field in the UI
    },
  );

export type CheckoutInput = z.infer<typeof checkoutSchema>;
