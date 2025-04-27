interface EmailBannerProps {
  email?: string;
}

export function EmailBanner({ email = "user@example.com" }: EmailBannerProps) {
  return (
    <div className="w-full p-3 bg-muted/30 rounded-lg">
      <p className="text-sm text-center text-foreground">{email}</p>
    </div>
  );
}
