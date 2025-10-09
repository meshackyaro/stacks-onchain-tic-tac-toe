// "use client";

// import { Connect } from "@stacks/connect-react"

// // import { STACKS_TESTNET } from "@stacks/network";


// // const appConfig = new AppConfig(["store_write"], STACKS_TESTNET);
// // const userSession = new UserSession({ appConfig });

// const appDetails = {
//   name: "Tic Tac Toe",
//   icon: "https://cryptologos.cc/logos/stacks-stx-logo.png",
// };

// export function StacksProvider({ children }: { children: React.ReactNode }) {
//   return (
//     <Connect
//       authOptions={{
//         appDetails,
//         // userSession,
//         redirectTo: "/",
//         onFinish: () => {
//           console.log("Wallet connected!");
//         },
//         onCancel: () => {
//           console.log("Wallet connection cancelled.");
//         },
//       }}
//     >
//       {children}
//     </Connect>
//   );
// }
