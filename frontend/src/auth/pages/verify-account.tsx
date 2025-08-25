import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardFooter } from "@/common/components/ui/card";
import { toast } from "@/common/hooks/use-toast";
import { parseError } from "@/common/utils/error";
import { motion } from "framer-motion";
import { Loader, Mail, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthUrl } from "../routes";
import { useResendVerificationEmail } from "../services/hooks";

const VerifyAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState<string>("");

  const { mutate: resendVerification, error: resendError, isPending: isResendPending } = useResendVerificationEmail();

  useEffect(() => {
    const emailFromState = location.state?.email;
    if (!emailFromState) {
      navigate(AuthUrl.login, { replace: true });
      return;
    }
    setEmail(emailFromState);
  }, [location.state, navigate]);

  // Handle countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendVerification = () => {
    if (countdown > 0 || !email || isResendPending) return;
    resendVerification(email, {
      onSuccess: () => {
        setCountdown(60);
        toast({
          title: "Verification Email Sent",
          description: "A new verification email has been sent.",
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background/5 p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              {resendError && (
                <div
                  className="bg-destructive/10 text-destructive rounded-md p-3 text-start text-sm mb-6 w-full"
                  data-cy="verification-error"
                >
                  {parseError(resendError)}
                </div>
              )}

              <div className="py-8 flex flex-col items-center w-full">
                <Mail className="h-16 w-16 text-primary mb-4" />
                <h2 className="text-xl font-semibold mb-2">Check Your Email</h2>
                <p className="text-muted-foreground mb-6">
                  We've sent a verification link to <span className="font-medium">{email}</span>
                </p>

                <div className="w-full space-y-4">
                  <div className="bg-muted rounded-md p-4 text-sm">
                    <p className="mb-2">
                      Click the link in the email to verify your account. If you don't see the email, check your spam folder.
                    </p>
                    <p>The verification link will expire in 24 hours.</p>
                  </div>

                  <Button
                    onClick={handleResendVerification}
                    className="w-full"
                    disabled={isResendPending || countdown > 0}
                    data-cy="resend-verification"
                  >
                    <span className="flex items-center gap-2">
                      {isResendPending ? (
                        <Loader className="h-4 w-4 animate-spin" data-cy="verification-loading" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend Verification Email"}
                    </span>
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center pb-6">
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already verified? </span>
                <Link to={AuthUrl.login} className="text-primary hover:underline" data-cy="back-to-login">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyAccount;
