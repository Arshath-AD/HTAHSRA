export default function Loader({ size = 50 }) {
    return (
        <div className="loader-container">
            <div className="neon-loader" style={{ width: size, height: size }} />
        </div>
    );
}
