const Loading: React.FC = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="animate-pulse py-16 font-monoline text-4xl text-accent xl:text-5xl">
        Loading...
      </div>
    </div>
  );
};

export default Loading;
