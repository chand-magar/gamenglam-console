import './index.css';

interface Props {
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ fullScreen = true }: Props) => {
  return (
    <div className={fullScreen ? 'spinner-overlay' : 'd-flex justify-content-center p-4'}>
      <div className="spinner-border spinner-border-purple" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};