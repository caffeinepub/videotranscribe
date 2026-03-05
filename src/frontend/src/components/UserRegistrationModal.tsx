import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic2 } from "lucide-react";
import { useState } from "react";
import { useSaveUserInfo } from "../hooks/useQueries";

interface UserRegistrationModalProps {
  onComplete: () => void;
}

export function UserRegistrationModal({
  onComplete,
}: UserRegistrationModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});
  const saveUserInfo = useSaveUserInfo();

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Please enter a valid email";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const id = crypto.randomUUID();
    const timestamp = BigInt(Date.now()) * 1_000_000n;

    try {
      await saveUserInfo.mutateAsync({
        id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        timestamp,
      });
    } catch {
      // Best-effort — proceed even if backend is unavailable
    }

    localStorage.setItem("ast_user_registered", "true");
    localStorage.setItem("ast_user_name", name.trim());
    localStorage.setItem("ast_user_email", email.trim());
    localStorage.setItem("ast_user_id", id);
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      data-ocid="registration.modal"
    >
      <div className="w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

        <div className="p-6 sm:p-8">
          {/* Icon + Title */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-3 shadow-glow-sm">
              <Mic2 className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-display font-bold text-xl text-foreground">
              Welcome! Let's personalize your experience
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              Tell us a little about yourself to get started with Arabic Scholar
              Translator.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="reg-name"
                className="text-sm font-medium text-foreground"
              >
                Full Name
              </Label>
              <Input
                id="reg-name"
                type="text"
                placeholder="e.g. Ahmed Ali"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: undefined }));
                }}
                className="bg-background/60 border-border/70 focus:border-primary/60"
                data-ocid="registration.input"
              />
              {errors.name && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="registration.error_state"
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="reg-email"
                className="text-sm font-medium text-foreground"
              >
                Email Address
              </Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: undefined }));
                }}
                className="bg-background/60 border-border/70 focus:border-primary/60"
                data-ocid="registration.input"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="reg-phone"
                className="text-sm font-medium text-foreground"
              >
                Phone Number
              </Label>
              <Input
                id="reg-phone"
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors((p) => ({ ...p, phone: undefined }));
                }}
                className="bg-background/60 border-border/70 focus:border-primary/60"
                data-ocid="registration.input"
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-2 font-semibold"
              disabled={saveUserInfo.isPending}
              data-ocid="registration.submit_button"
            >
              {saveUserInfo.isPending ? "Setting up..." : "Get Started →"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
