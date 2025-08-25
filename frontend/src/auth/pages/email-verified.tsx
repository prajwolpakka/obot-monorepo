import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardFooter } from "@/common/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthUrl } from "../routes";

const EmailVerified = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background/5 p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <CheckCircle className="h-16 w-16 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Email Successfully Verified!</h2>
              <p className="text-muted-foreground mb-6">
                Your email address has been successfully verified. You can now log in to your account.
              </p>
              <Button asChild className="w-full" data-cy="continue-button">
                <Link to={AuthUrl.login} replace>
                  Go to Login
                </Link>
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center pb-6"></CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerified;
