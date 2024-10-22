import { data } from "./App.js";

export function Meals() {
  return data && Array.isArray(data) ? (
    data.map((m) => (
      <li key={m.idMeal}>
        {m.strMeal} - {m.strCategory} - {m.strArea}
        <img src={m.strMealThumb} alt="" />
      </li>
    ))
  ) : (
    <p className="errortext">
      Oops! <br /> Seems like there is an issue with the API
    </p>
  );
}
