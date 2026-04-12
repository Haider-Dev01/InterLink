import { RegisterForm } from '../components/auth/RegisterForm'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">InternLink</h1>
        </div>
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Inscription</CardTitle>
            <CardDescription>
              Créez votre compte pour commencer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-slate-500 dark:text-slate-400">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-slate-900 font-semibold underline underline-offset-4 hover:text-slate-700 dark:text-slate-50 dark:hover:text-slate-300">
                Se connecter
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
