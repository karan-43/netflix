
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFavouriteList, getFavouriteList } from "../../features/favouriteSlice/favouriteSlice";


const FavoriteVideos = () => {

  const [selected, setSelected] = useState("all");

  const dispatch = useDispatch()

  const { favourite } = useSelector((state) => state.favourite)

  const favouriteList = favourite?.data

  useEffect(() => {
    dispatch(getFavouriteList({}))
  }, [])

  const getCategoryUpdate = (item) => {
    if (item !== "all") {
      setSelected(item._id)
      dispatch(getFavouriteList({ categoryId: item._id }))
    } else {
      setSelected("all")
      dispatch(getFavouriteList({}))
    }
  }


  if (favourite?.loading && !favouriteList) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020b1c]">
      <ul className="view flex gap-4 overflow-x-auto pt-12 pb-2 scrollbar-hide">
        <label
          htmlFor="all"
          className={`px-5 py-2 rounded-xl cursor-pointer transition whitespace-nowrap
          ${selected === "all"
              ? "bg-red-600 text-white font-semibold"
              : "border border-gray-600 text-gray-300 hover:bg-gray-800"
            }`}
        >
          All
          <input
            type="radio"
            name="category"
            id="all"
            className="hidden"
            checked={selected === "all"}
            onChange={() => getCategoryUpdate("all")}
          />
        </label>
        {favouriteList?.categories?.map((item, idx) => (
          <label
            key={idx}
            htmlFor={`category-${idx}`}
            className={`px-5 py-2 rounded-xl cursor-pointer transition whitespace-nowrap
            ${selected === item._id
                ? "bg-red-600 text-white font-semibold"
                : "border border-gray-600 text-gray-300 hover:bg-gray-800"
              }`}
          >
            {item?.name}
            <input
              type="radio"
              name="category"
              id={`category-${idx}`}
              className="hidden"
              checked={selected === item._id}
              onChange={() => getCategoryUpdate(item)}
            />
          </label>
        ))}
      </ul>

      <section className="view py-12">
        {favouriteList?.videos?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favouriteList.videos.map((item, idx) => (
              <div key={idx} className="group relative bg-[#0a162d]/40 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all hover:shadow-2xl hover:shadow-red-500/10">
                <div className="relative w-full aspect-video overflow-hidden">
                  <img
                    src={item?.thumbnail}
                    alt={item?.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300"></div>

                  <button
                    className="absolute top-3 right-3 bg-black/60 backdrop-blur-md p-2.5 rounded-full hover:scale-110 transition active:scale-95 z-10"
                    onClick={() => {/* handle remove from favorite later */ }}
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </button>

                  <span className="absolute bottom-2 right-2 text-[10px] font-bold tracking-tighter bg-black/60 backdrop-blur-md px-2 py-1 rounded text-white border border-white/10">
                    {`${Math.floor(item?.duration / 60)}h ${Math.floor(item?.duration % 60)}m`}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-red-500 transition duration-300">
                    {item?.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                    {item?.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Heart size={48} className="mb-4 opacity-20" />
            <p>No favorite videos found in this category.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default FavoriteVideos;