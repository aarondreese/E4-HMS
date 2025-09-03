import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center p-24 min-h-screen">
      <h1 className="mb-8 font-bold text-3xl">HMS Admin Portal</h1>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <a
          href="/property"
          className="bg-green-600 hover:bg-green-700 shadow px-6 py-4 rounded text-white text-lg text-center"
        >
          Property Maintenance
        </a>
        <a
          href="/Attribute"
          className="bg-blue-600 hover:bg-blue-700 shadow px-6 py-4 rounded text-white text-lg text-center"
        >
          Attributes
        </a>
        <a
          href="/AttributeGroup"
          className="bg-purple-600 hover:bg-purple-700 shadow px-6 py-4 rounded text-white text-lg text-center"
        >
          Attribute Groups
        </a>
      </div>
    </main>
  );
}
