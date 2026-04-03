import { useState } from "react";
import { useDispatch } from "react-redux";
import { getVideo } from "../../features/homeSlice/homeSlice";

export default function CategoryTabs({ categoriesItem }) {
    const [selected, setSelected] = useState("all");

    const dispatch = useDispatch()

    const getCategoryUpdate = (item) => {
        dispatch(selected == "all" ? getVideo() : getVideo(item?._id))
        if (item !== "all") {
            setSelected(item._id)
        } else {
            setSelected("all")
        }
    }

    return (
        <ul className="flex gap-4 overflow-x-auto">
            <label
                htmlFor="all"
                className={`px-5 py-2 rounded-xl cursor-pointer transition whitespace-nowrap
          ${selected === "all"
                        ? "bg-gray-200 text-black border-2 border-blue-500 font-semibold"
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
            {categoriesItem?.map((item, idx) => (
                console.log(item, "categories"),
                <label
                    key={idx}
                    htmlFor={`category-${idx}`}
                    className={`px-5 py-2 rounded-xl cursor-pointer transition whitespace-nowrap
            ${selected === item._id
                            ? "bg-gray-200 text-black border-2 border-blue-500 font-semibold"
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
    );
}