/* eslint-disable @next/next/no-img-element -- fixed-size logo assets, next/image sizing not worth the ceremony here */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <img src="/resources/pacaf.png" alt="" className="h-16 w-auto" />
          <h1 className="text-xl font-semibold">Eielson Airfield Management</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
