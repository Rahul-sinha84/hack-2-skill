import SignIn from "@/components/SignIn";
import React from "react";
// instrumentation-client.js

const APage = () => {
  return (
    <div>
      <h1>You are authenticated!</h1>
      <SignIn />
    </div>
  );
};

export default APage;
