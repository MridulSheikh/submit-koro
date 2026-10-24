"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { CheckCircle2, UserRound } from "lucide-react";
import ImageUploadInput from "@/components/ui/ImageUploadInput";
import ChangePasswordDialog from "@/components/profile/ChangePasswordDialog";
import { profileSchema, type ProfileFormValues } from "@/lib/schemas/profile.schema";
import { withMutationToast } from "@/lib/mutation-toast";

type Profile = {
  name: string;
  email: string;
  image: string | null;
};

function getErrorMessage(value: unknown, fallback: string): string {
  if (typeof value !== "object" || value === null) return fallback;

  const result = value as Record<string, unknown>;
  if (typeof result.message === "string") return result.message;
  if (typeof result.errorMessage === "string") return result.errorMessage;
  return fallback;
}

export default function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", image: "" },
    mode: "onTouched",
  });
  const imageValue = useWatch({ control, name: "image" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const apiUrl = (
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
        ).replace(/\/$/, "");
        const response = await fetch(`${apiUrl}/api/users/me`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        const result: unknown = await response.json();

        if (!response.ok) {
          setLoadError(getErrorMessage(result, "Unable to load your profile."));
          return;
        }

        if (
          typeof result !== "object" ||
          result === null ||
          !("data" in result) ||
          typeof result.data !== "object" ||
          result.data === null ||
          !("name" in result.data) ||
          typeof result.data.name !== "string" ||
          !("email" in result.data) ||
          typeof result.data.email !== "string" ||
          !("image" in result.data) ||
          (typeof result.data.image !== "string" && result.data.image !== null)
        ) {
          setLoadError("The server returned an invalid profile.");
          return;
        }

        const loadedProfile: Profile = {
          name: result.data.name,
          email: result.data.email,
          image: result.data.image,
        };
        setProfile(loadedProfile);
        reset({
          name: loadedProfile.name,
          image: loadedProfile.image ?? "",
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load your profile. Please try again.",
        );
      }
    }

    void loadProfile();
    return () => controller.abort();
  }, [reset]);

  const onSubmit: SubmitHandler<ProfileFormValues> = async (values) => {
    setSaveError("");
    setSaved(false);
    if (!profile) {
      setSaveError("Your profile is still loading. Please try again.");
      return;
    }

    try {
      const apiUrl = (
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
      ).replace(/\/$/, "");
      const result = await withMutationToast<{ name: string; image: string | null }>({ loading: "Saving profile…", success: "Profile saved.", error: "Unable to save your profile." }, async () => {
        const response = await fetch(`${apiUrl}/api/users/me`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: values.name, image: values.image || null }),
        });
        const responseData: unknown = await response.json();
        if (!response.ok) throw new Error(getErrorMessage(responseData, "Unable to save your profile."));
        if (
          typeof responseData !== "object" || responseData === null || !("data" in responseData) ||
          typeof responseData.data !== "object" || responseData.data === null ||
          !("name" in responseData.data) || typeof responseData.data.name !== "string" ||
          !("image" in responseData.data) ||
          (typeof responseData.data.image !== "string" && responseData.data.image !== null)
        ) throw new Error("The server returned an invalid profile.");
        return {
          name: responseData.data.name as string,
          image: responseData.data.image as string | null,
        };
      });

      const updatedProfile = {
        ...profile,
        name: result.name,
        image: result.image,
      };
      setProfile(updatedProfile);
      reset({
        name: updatedProfile.name,
        image: updatedProfile.image ?? "",
      });
      setSaved(true);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Unable to save your profile. Please try again.",
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="mb-8">
        <p className="mb-2 text-sm font-medium text-blue-700">Account settings</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Edit profile
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Update the name and profile photo associated with your account.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
        {loadError ? (
          <p
            className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
            role="alert"
          >
            {loadError}
          </p>
        ) : !profile ? (
          <p className="text-sm text-slate-500" role="status">
            Loading your profile...
          </p>
        ) : (
          <>
              <div className="mb-8 flex flex-wrap items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-700">
                {imageValue ? (
                  // The profile image URL is provided by the API and may be from any host.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageValue}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <UserRound className="size-6" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {profile.name}
                </p>
                <p className="truncate text-sm text-slate-500">{profile.email}</p>
              </div>
              <div className="sm:ml-auto">
                <ChangePasswordDialog />
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div>
                <label
                  htmlFor="profile-name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Full name
                </label>
                <input
                  {...register("name")}
                  id="profile-name"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "profile-name-error" : undefined}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                {errors.name && (
                  <p id="profile-name-error" className="mt-1 text-xs text-red-600" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  readOnly
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-500 outline-none"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Email address cannot be changed here.
                </p>
              </div>

              <div>
                <p className="mb-2 block text-sm font-medium text-slate-700">
                  Profile image
                </p>
                <ImageUploadInput
                  value={imageValue}
                  onChange={(image) => {
                    setValue("image", image ?? "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setSaved(false);
                  }}
                  disabled={isSubmitting}
                />
                {errors.image ? (
                  <p id="profile-image-error" className="mt-1 text-xs text-red-600" role="alert">
                    {errors.image.message}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">
                    Images are securely stored in Cloudinary. Save changes to update your profile.
                  </p>
                )}
              </div>

              {saveError && (
                <p
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                  role="alert"
                >
                  {saveError}
                </p>
              )}
              {saved && (
                <p
                  className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                  role="status"
                >
                  <CheckCircle2 className="size-4 shrink-0" />
                  Profile saved successfully.
                </p>
              )}

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
