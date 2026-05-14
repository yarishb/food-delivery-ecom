import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Увійти",
  description: "Увійдіть у свій акаунт.",
}

export default function Login() {
  return <LoginTemplate />
}
