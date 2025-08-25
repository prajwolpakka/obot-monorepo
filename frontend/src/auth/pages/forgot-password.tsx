import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { useToast } from "@/common/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { forgotPasswordSchema, IForgotPasswordSchema } from "../models/schema";
import { useForgotPassword } from "../services/hooks";

const ForgotPasswordPage = () => {
	const { mutate: forgotPassword, isPending, isSuccess, error } = useForgotPassword();
	const { toast } = useToast();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<IForgotPasswordSchema>({
		resolver: zodResolver(forgotPasswordSchema),
	});

	const onSubmit = (data: IForgotPasswordSchema) => {
		forgotPassword(data, {
			onSuccess: () => {
				toast({
					title: "Reset email sent",
					description: "Check your email for password reset instructions.",
				});
			},
			onError: (error: any) => {
				toast({
					title: "Failed to send reset email",
					description: error?.response?.data?.message || "Please try again.",
					variant: "destructive",
				});
			},
		});
	};

	if (isSuccess) {
		return (
			<AuthLayout>
				<Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl font-bold text-slate-900">Check Your Email</CardTitle>
					</CardHeader>
					<CardContent className="text-center space-y-4">
						<p className="text-slate-600">We've sent a password reset link to your email address.</p>
						<Link to="/login">
							<Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
								Back to Sign In
							</Button>
						</Link>
					</CardContent>
				</Card>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout>
			<Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold text-slate-900">Forgot Password</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						{error && (
							<Alert variant="destructive">
								<AlertDescription>
									{/* {error?.response?.data?.message || "Failed to send reset email. Please try again."} */}
								</AlertDescription>
							</Alert>
						)}

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" placeholder="Enter your email" {...register("email")} />
							{errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
						</div>

						<Button
							type="submit"
							className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
							disabled={isPending}
						>
							{isPending ? "Sending..." : "Send Reset Instructions"}
						</Button>

						<div className="text-center text-sm mt-4">
							<span className="text-slate-600">Remember your password? </span>
							<Link to="/login" className="text-blue-600 hover:underline font-medium">
								Login
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</AuthLayout>
	);
};

export default ForgotPasswordPage;
