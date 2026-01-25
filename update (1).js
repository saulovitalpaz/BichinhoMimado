// Exemplo de lógica para o componente de Saldo
function FinancialCard({ value }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="card-financial">
      <h3>Saldo em Caixa</h3>
      <div className="flex items-center">
        <span>{isVisible ? `R$ ${value}` : '••••••'}</span>
        <button onClick={() => setIsVisible(!isVisible)}>
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}