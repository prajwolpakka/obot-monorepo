import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import { Loader, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthUrl } from "../routes";
import { useResendVerificationEmail, useVerifyEmail } from "../services/hooks";

const VerifyAccountByToken = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerificationEmail();

  const verifyMutationRef = useRef(verifyMutation);

  useEffect(() => {
    verifyMutationRef.current = verifyMutation;
  }, [verifyMutation]);

  useEffect(() => {
    if (!token) {
      console.error("VerifyAccountByToken: No token provided.");
      navigate(AuthUrl.login, { replace: true });
      return;
    }

    if (verifyMutationRef.current.status === "idle") {
      console.log("VerifyAccountByToken: Calling verifyMutation.mutate with token:", token);
      verifyMutationRef.current.mutate(token, {
        onSuccess: () => {
          console.log("VerifyAccountByToken: Verification success, navigating...");
          navigate(AuthUrl.emailVerified, { replace: true });
        },
        onError: (error) => {
          const authError = error;
          console.error("Email verification error:", authError);
        },
      });
    } else {
      console.log(`VerifyAccountByToken: Skipping mutate call because status is: ${verifyMutationRef.current.status}`);
    }
  }, [token, navigate]);

  const handleResendVerification = () => {
    if (!token || resendMutation.isPending) return;

    // resendMutation.mutate(token, {
    //   onSuccess: (response) => {
    //     setResendSuccess(true);
    //     toast({ title: "Verification Email Sent", description: response.message });
    //   },
    //   onError: (error) => {
    //     const authError = error;
    //     console.error("Resend verification by token error:", authError);
    //     toast({
    //       title: "Error",
    //       description: authError.message || "Failed to resend verification.",
    //       variant: "destructive",
    //     });
    //   },
    // });
  };

  const isVerifying = verifyMutation.status === "pending";
  const isResending = resendMutation.isPending;

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background/5 p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="py-8 flex flex-col items-center w-full">
                <Loader className="h-16 w-16 text-primary animate-spin mb-4" />
                <h2 className="text-xl font-semibold mb-2">Verifying your email</h2>
                <p className="text-muted-foreground">Please wait while we verify your email address...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background/5 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="py-8 flex flex-col items-center w-full">
              <h2 className="text-xl font-semibold mb-2">Verification Failed</h2>
              <p className="text-muted-foreground mb-6">Could not verify your email. Please try again or contact support.</p>

              {resendSuccess ? (
                <div className="w-full space-y-4">
                  <div className="bg-primary/10 text-primary rounded-md p-4 text-sm">
                    <p className="font-medium mb-1">Verification email sent!</p>
                    <p>Please check your inbox and click the link to verify your account.</p>
                  </div>
                  <Button onClick={() => navigate(AuthUrl.login)} variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </div>
              ) : (
                <Button onClick={handleResendVerification} className="w-full" disabled={isResending}>
                  <span className="flex items-center gap-2">
                    {isResending ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Request New Verification
                  </span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyAccountByToken;
