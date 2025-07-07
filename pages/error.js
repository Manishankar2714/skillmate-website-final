export default function Error({ error }) {
  return (
    <div>
      <h1>Login Failed</h1>
      <p>Reason: {error}</p>
    </div>
  );
}
