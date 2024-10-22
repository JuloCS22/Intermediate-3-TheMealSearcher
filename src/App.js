import { useEffect, useState } from "react";
import "./styles.css";

// Refaire un truc plus joli que ça !!!!!!!!

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState("");
  const [mealModal, setMealModal] = useState([]);
  const [mealName, setMealName] = useState("");
  const [mealId, setMealId] = useState("");
  const [favoritesMeals, setFavoritesMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [whatIs, setWhatIs] = useState("search.php?s=");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavoriteOn, setIsFavoriteOn] = useState(false);
  const [favId, setFavId] = useState(() => {
    const savedMeals = localStorage.getItem("favId");
    try {
      return savedMeals ? JSON.parse(savedMeals) : [];
    } catch (error) {
      console.log("Error during parsing.", error);
      return [];
    }
  });

  function fetchMeals() {
    setLoading(true);
    const fetchSearch = `https://www.themealdb.com/api/json/v1/1/${whatIs}${mealName}`;
    fetch(fetchSearch)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur dans la requête");
        }
        return response.json();
      })
      .then((data) => {
        setData(data.meals);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }

  function fetchMealModal() {
    setLoading(true);
    const fetchSearch = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;
    fetch(fetchSearch)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur dans la requête");
        }
        return response.json();
      })
      .then((mealModal) => {
        setMealModal(mealModal.meals[0]);
        setLoading(false);
      })
      .catch((error) => {});
  }

  function fetchCategories() {
    const fetchCategories =
      "https://www.themealdb.com/api/json/v1/1/list.php?c=list";
    fetch(fetchCategories)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur dans la requête");
        }
        return response.json();
      })
      .then((categories) => {
        setCategories(categories.meals);
      })
      .catch((error) => {
        setError(error);
      });
  }

  function handleClick(e) {
    setMealModal(null);
    setMealId(e);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setMealId(null);
  }

  function handleNameChange(e) {
    setWhatIs("search.php?s=");
    setSelectedCategory("");
    setMealName(e.target.value);
  }

  function handleCategoryChange(e) {
    setWhatIs("filter.php?c=");
    setMealName(e.target.value);
  }

  function returnHome() {
    setIsFavoriteOn(false);
    setMealModal(null);
    setWhatIs("search.php?s=");
    setMealName("");
  }

  function showFavoritesMeals() {
    setFavoritesMeals([]);
    setIsFavoriteOn(true);
  }

  function handleFavoriteMeal(e) {
    if (favId.includes(e)) {
      setFavId((prevFavId) => prevFavId.filter((id) => id !== e));
    } else {
      setFavId((prevFavId) => [...prevFavId, e]);
    }
  }

  const showMeals =
    data && !isFavoriteOn ? (
      data.map((m) => (
        <div key={m.idMeal} className="mealThumb">
          <img
            src={m.strMealThumb}
            alt=""
            onClick={() => handleClick(m.idMeal)}
          />
          {m.strMeal}
        </div>
      ))
    ) : isFavoriteOn ? (
      favoritesMeals.map((m) => (
        <div key={m.idMeal} className="mealThumb">
          <img
            src={m.strMealThumb}
            alt=""
            onClick={() => handleClick(m.idMeal)}
          />
          {m.strMeal}
        </div>
      ))
    ) : (
      <p className="errortext">
        Oops! <br /> Seems like there is an issue with the API
      </p>
    );

  const formattedText =
    mealModal && mealModal.strInstructions
      ? mealModal.strInstructions.replace(/\.\s*/g, ".<br />")
      : "";

  const modalContent =
    mealModal && isModalOpen ? (
      <div id="myModal" className="modal" style={{ display: "block" }}>
        <div className="modal-content">
          <span className="close" onClick={() => closeModal()}>
            &times;
          </span>
          <span
            className={
              favId.includes(mealModal.idMeal)
                ? "modal-heart-red"
                : "modal-heart-green"
            }
            onClick={() => handleFavoriteMeal(mealModal.idMeal)}
          >
            {favId.includes(mealModal.idMeal)
              ? "Remove from favorites"
              : "Add to favorites"}
          </span>
          <div key={mealModal.idMeal} className="modal-display">
            <img src={mealModal.strMealThumb} alt="" className="modal-img" />
            <h4>{mealModal.strMeal}</h4>
            <h5>
              This {mealModal.strCategory} meal is {mealModal.strArea}
            </h5>
            <p dangerouslySetInnerHTML={{ __html: formattedText }}></p>
            <ul className="modal-list">
              {Array.from({ length: 20 }, (_, index) => {
                const ingredient = mealModal[`strIngredient${index + 1}`];
                const measure = mealModal[`strMeasure${index + 1}`];

                if (ingredient) {
                  return (
                    <li key={index}>
                      {ingredient} - {measure}
                    </li>
                  );
                }
                return null; //
              })}
            </ul>
          </div>
        </div>
      </div>
    ) : (
      <></>
    );

  useEffect(() => {
    if (mealName) {
      fetchMeals();
    } else {
      setData([]);
    }

    fetchCategories();

    if (mealId) {
      fetchMealModal();
    }

    if (isFavoriteOn && favId.length >= 0) {
      const favoritePromises = favId.map((id) => {
        return fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error("Erreur dans la requête");
            }
            return response.json();
          })
          .then((data) => data.meals[0])
          .catch((error) => {
            console.error("Erreur lors de la récupération du favori :", error);
            return null;
          });
      });

      Promise.all(favoritePromises).then((results) => {
        const validFavorites = results.filter((meal) => meal !== null);
        setFavoritesMeals(validFavorites);
      });
    }
  }, [mealName, mealId, favId, isFavoriteOn]);

  useEffect(() => {
    localStorage.setItem("favId", JSON.stringify(favId));
  }, [favId]);

  return (
    <div>
      <h1>TheMealSearcher</h1>
      <h2>V 0</h2>

      <div className="navbar">
        <button className="navbarButton" onClick={returnHome}>
          HOME
        </button>
        <button className="navbarButton" onClick={showFavoritesMeals}>
          FAVORITES
          <span className={favId.length > 0 ? "fav-number" : ""}>
            {favId.length > 0 ? favId.length.toString() : ""}
          </span>
        </button>
      </div>

      {!isFavoriteOn ? (
        <>
          <div className="searchbar">
            <input
              type="text"
              className="searchinput"
              placeholder="search meal name"
              value={whatIs === "search.php?s=" ? mealName : ""}
              onChange={handleNameChange}
            />
          </div>
          <div className="categoryfilter">
            <h5>Search by Categories</h5>
            {categories.map((c, index) => (
              <button
                id={index}
                className="categorybutton"
                value={c.strCategory}
                onClick={handleCategoryChange}
              >
                {c.strCategory}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <button onClick={() => setFavId([])}>Delete all Favorites</button>
        </>
      )}

      <div className="mealsplace">
        {showMeals}
        {modalContent}
      </div>

      <div className="thanks">
        This app is made with appetite thanks to{" "}
        <a href="https://www.themealdb.com/api.php">TheMealDB.</a> <br />
      </div>
    </div>
  );
}
