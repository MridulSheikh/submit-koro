import { toast } from "sonner";

type MutationToastMessages = {
  loading: string;
  success: string;
  error: string;
};

export async function withMutationToast<T>(
  messages: MutationToastMessages,
  operation: () => Promise<T>,
): Promise<T> {
  const id = toast.loading(messages.loading);
  try {
    const result = await operation();
    toast.success(messages.success, { id });
    return result;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : messages.error, { id });
    throw error;
  }
}
