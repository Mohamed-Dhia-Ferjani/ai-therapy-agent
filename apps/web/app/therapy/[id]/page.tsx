import { Chat } from "@/components/ChatBox";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  console.log(id);
  return (
    <div>
      <Chat sessionId={id} />
    </div>
  );
};

export default page;
