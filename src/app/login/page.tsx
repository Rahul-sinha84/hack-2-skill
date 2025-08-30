import SignIn from "@/components/SignIn";
import React from "react";

const LoginPage = () => {
  return (
    <div>
      <h1>You are not authenticated!</h1>
      <SignIn />
    </div>
  );
};

export default LoginPage;
