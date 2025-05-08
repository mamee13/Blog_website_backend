import dynamic from 'next/dynamic';
import 'quill/dist/quill.snow.css';

const QuillNoSSR = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    return RQ;
  },
  { ssr: false }
);

// Your editor component
export default function Editor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <QuillNoSSR
      theme="snow"
      value={value}
      onChange={onChange}
      // ... your other Quill props
    />
  );
}