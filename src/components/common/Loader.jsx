function Loader({ label = "Loading..." }) {
  return <div className="loader" role="status" aria-live="polite">{label}</div>;
}

export default Loader;
