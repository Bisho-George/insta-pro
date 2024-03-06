import Loader from '@/components/shared/Loader';
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from '@/components/ui/use-toast';
import { useUserContext } from '@/context/AuthContext';
import { useSignInAccount } from '@/lib/react-query/queriesAndMutations';
import { SigninValidation } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from 'react-router-dom';
import * as z from 'zod';

const SigninForm = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { checkAuthUser, isLoading: isUserLoading } = useUserContext()

    const { mutateAsync: signInAccount, isPending } = useSignInAccount()

    const form = useForm<z.infer<typeof SigninValidation>>({
        resolver: zodResolver(SigninValidation),
        defaultValues: {
            email: '',
            password: ''
        },
    })


    // 2. Define a submit handler.
    const onSubmit = async (values: z.infer<typeof SigninValidation>) => {

        const session = await signInAccount({
            email: values.email,
            password: values.password
        });

        if (!session) {
            toast({ title: 'Sign in failed, Please try again.' });
        } else {
            const isLoggedIn = await checkAuthUser();
            if (isLoggedIn) {
                form.reset();
                navigate('/');
            } else {
                toast({ title: 'Sign in failed, please try again.' });
            }
        }
    }

    return (
        <Form {...form}>
            <div className='flex-col flex-center sm:w-420'>
                <img src="/assets/images/logo.svg" alt="logo" />
                <h2 className='pt-5 h3-bold md:h2-bold sm:pt-12'>Log in to your account</h2>
                <p className='text-light-3 small-medium md:base-regular'>Welcome back! Please enter your details</p>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full gap-5 mt-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>E-mail</FormLabel>
                                <FormControl>
                                    <Input type='email' className='shad-input'  {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type='password' className='shad-input'  {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button className='shad-button_primary' type="submit">
                        {isPending ? (
                            <Loader />
                        ) :
                            "Sign in"}
                    </Button>
                    <p className='mt-2 text-center text-small-regular text-light-2'>
                        Don't have an account? 
                        <Link to="/sign-up" className='ml-1 text-primary-500 text-small-semibold'>Sign up</Link>
                    </p>
                </form>
            </div>
        </Form>
    )
}

export default SigninForm

