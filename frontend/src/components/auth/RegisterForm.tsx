import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { authService } from '../../services/authService'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const registerSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
  confirmPassword: z.string(),
  role: z.enum(['candidate', 'recruiter']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'candidate',
    },
  })

  async function onSubmit(data: RegisterFormValues) {
    try {
      setIsLoading(true)
      const user = await authService.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      })
      if (user.role === 'candidate') navigate('/dashboard')
      else if (user.role === 'recruiter') navigate('/recruiter')
    } catch (error) {
      toast.error("Erreur lors de l'inscription")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom</Label>
          <Input id="firstName" placeholder="Jean" {...register('firstName')} />
          {errors.firstName && <p className="text-[0.8rem] font-medium text-red-500">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input id="lastName" placeholder="Dupont" {...register('lastName')} />
          {errors.lastName && <p className="text-[0.8rem] font-medium text-red-500">{errors.lastName.message}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="votre@email.com" {...register('email')} />
        {errors.email && <p className="text-[0.8rem] font-medium text-red-500">{errors.email.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" type="password" placeholder="********" {...register('password')} />
        {errors.password && <p className="text-[0.8rem] font-medium text-red-500">{errors.password.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <Input id="confirmPassword" type="password" placeholder="********" {...register('confirmPassword')} />
        {errors.confirmPassword && <p className="text-[0.8rem] font-medium text-red-500">{errors.confirmPassword.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Vous êtes ?</Label>
        <select
          id="role"
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
          {...register('role')}
        >
          <option value="candidate">Étudiant (Candidat)</option>
          <option value="recruiter">Entreprise (Recruteur)</option>
        </select>
        {errors.role && <p className="text-[0.8rem] font-medium text-red-500">{errors.role.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        S'inscrire
      </Button>
    </form>
  )
}
