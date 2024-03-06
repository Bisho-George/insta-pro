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
import { useCreateUserAccount, useSignInAccount } from '@/lib/react-query/queriesAndMutations';
import { SignupValidation } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from 'react-router-dom';
import * as z from 'zod';

const SignupForm = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { checkAuthUser, isLoading: isUserLoading } = useUserContext()

    const { mutateAsync: createUserAccount, isPending: isCreatingUser } = useCreateUserAccount()

    const { mutateAsync: signInAccount, isPending: isSigningIn } = useSignInAccount()

    const form = useForm<z.infer<typeof SignupValidation>>({
        resolver: zodResolver(SignupValidation),
        defaultValues: {
            name: '',
            username: '',
            email: '',
            password: ''
        },
    })


    // 2. Define a submit handler.
    const onSubmit = async (values: z.infer<typeof SignupValidation>) => {
    // Create the user.
    const newUser = await createUserAccount(values);

    if (!newUser) {
        toast({
            title: "Sign up failed, Please try again.",
        });
    } else {
        // Proceed with sign-in logic if user creation is successful.
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
}

    return (
        <Form {...form}>
            <div className='flex-col flex-center sm:w-420'>
                <img src="/assets/images/logo.svg" alt="logo" />
                <h2 className='pt-5 h3-bold md:h2-bold sm:pt-12'>Create a new account</h2>
                <p className='text-light-3 small-medium md:base-regular'>To use Insta-Pro, please enter your account details</p>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full gap-5 mt-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input type='text' className='shad-input'  {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input type='text' className='shad-input'  {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                        {isCreatingUser ? (
                            <Loader />
                        ) :
                            "Sign up"}
                    </Button>
                    <p className='mt-2 text-center text-small-regular text-light-2'>
                        Already have an account
                        <Link to="/sign-in" className='ml-1 text-primary-500 text-small-semibold'>Log in</Link>
                    </p>
                </form>
            </div>
        </Form>
    )
}

export default SignupForm
