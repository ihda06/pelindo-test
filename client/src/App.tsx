import { useEffect, useState } from "react";
import "./App.css";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { axios } from "./utils";
import { isAxiosError } from "axios";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

function App() {
  const [title, setTitle] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editID, setEditID] = useState<number | null>(null);
  const [status, setSTatus] = useState<"pending" | "completed">("pending");
  const [desc, setDesc] = useState("");
  const [data, setData] = useState<
    {
      TITLE: string;
      DESCRIPTION: string;
      STATUS: number;
      ID: number;
    }[]
  >([]);

  useEffect(() => {
    fetch("http://localhost:2020/tasks")
      .then((res) => res.json())
      .then((data) => {
        setData(data.payload.data);
      });
  }, []);

  const handleEdit = async () => {
    try {
      const res = await axios.put(`/tasks/${editID}`, {
        title,
        description: desc,
        status,
      });
      setTitle("");
      setDesc("");
      setSTatus("pending");
      const newData = data.map((item) => {
        if (item.ID === editID) {
          return {
            ...item,
            TITLE: title,
            DESCRIPTION: desc,
            STATUS: status === "completed" ? 1 : 0,
          };
        }
        return item;
      });
      setEditID(null);
      setIsEdit(false);
      setData(newData);
      toast.success(res.data.payload.message);
    } catch (error) {
      if (isAxiosError(error)) {
        error.response?.data.errors.map((msg: string) => toast.error(msg));
      }
    }
  };

  const onsubmit = async () => {
    try {
      const res = await axios.post("/tasks", {
        title,
        description: desc,
        status,
      });
      setTitle("");
      setDesc("");
      setSTatus("pending");
      const newData = {
        TITLE: title,
        DESCRIPTION: desc,
        STATUS: status === "completed" ? 1 : 0,
        ID: res.data.payload.data.ID,
      };

      setData([...data, newData]);
      toast.success(res.data.payload.message);
    } catch (error) {
      if (isAxiosError(error)) {
        error.response?.data.errors.map((msg: string) => toast.error(msg));
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await axios.delete(`/tasks/${id}`);
      setData(data.filter((item) => item.ID !== id));
      toast.success(res.data.payload.message);
    } catch (error) {
      if (isAxiosError(error)) {
        error.response?.data.errors.map((msg: string) => toast.error(msg));
      }
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="flex gap-6 w-full px-28 ">
        <div className="bg-slate-50 p-5 rounded-lg space-y-3 w-2/3 shadow-md">
          <div className="flex gap-8 justify-between border-b p-3">
            <h1 className="text-3xl font-bold">Task</h1>
          </div>

          <ul className="space-y-3 p-3">
            {data?.length > 0 ? (
              data?.map((item) => (
                <li
                  className={
                    "rounded-lg p-3 hover:-translate-y-1 hover:translate-x-1 duration-300 hover:shadow-lg " +
                    (item.STATUS === 0 ? "bg-red-100" : "bg-green-100")
                  }
                  key={item.ID}
                >
                  <div className=" justify-between flex">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          "size-3 animate-pulse rounded-full block " +
                          (item.STATUS === 0 ? "bg-red-500" : "bg-green-500")
                        }
                      />
                      <span>{item.STATUS === 0 ? "Pending" : "Completed"}</span>
                    </div>
                    <div className="space-x-2">
                      <button
                        className="p-1 hover:bg-slate-50"
                        onClick={() => {
                          setIsEdit(true);
                          setTitle(item.TITLE);
                          setDesc(item.DESCRIPTION);
                          setSTatus(
                            item.STATUS === 0 ? "pending" : "completed"
                          );
                          setEditID(item.ID);
                        }}
                      >
                        <PencilSquareIcon className="size-5" />
                      </button>
                      <button
                        className="p-1 hover:bg-slate-50"
                        onClick={() => {
                          handleDelete(item.ID);
                        }}
                      >
                        <TrashIcon className="size-5" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{item.TITLE}</h3>
                    <p>{item.DESCRIPTION}</p>
                  </div>
                </li>
              ))
            ) : (
              <div className="text-center">No Data</div>
            )}
          </ul>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isEdit) {
              handleEdit();
            } else {
              onsubmit();
            }
          }}
          className="bg-slate-50 p-5 rounded-lg space-y-3 flex flex-col w-1/3 shadow-md"
        >
          <h1 className="text-3xl font-bold">{isEdit ? "Edit" : "Add"} Task</h1>
          <div className="flex flex-col">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              name="title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              className="p-2 rounded-xl border border-slate-200"
              autoComplete="off"
              placeholder="title"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="title">Description</label>
            <textarea
              name="title"
              rows={3}
              onChange={(e) => setDesc(e.target.value)}
              value={desc}
              className="p-2 rounded-xl border border-slate-200"
              autoComplete="off"
              placeholder="description"
            />
          </div>

          <label
            className="inline-flex items-center cursor-pointer"
            onClick={() => {
              if (status === "pending") {
                setSTatus("completed");
              } else {
                setSTatus("pending");
              }
            }}
            htmlFor="status"
          >
            <input
              type="checkbox"
              className="sr-only peer"
              name="status"
              onChange={() => {}}
              checked={status !== "pending"}
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-400"></div>
            {status === "pending" ? (
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Pending
              </span>
            ) : (
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Completed
              </span>
            )}
          </label>
          <div className="flex gap-1">
            <button
              type="submit"
              className="py-2 px-3 self-baseline rounded-xl border border-slate-200  bg-gradient-to-br from-blue-200 to-teal-200"
            >
              Submit
            </button>
            {isEdit && (
              <button
                onClick={() => {
                  setIsEdit(false);
                  setTitle("");
                  setDesc("");
                  setSTatus("pending");
                  setEditID(null);
                }}
                type="button"
                className="py-2 px-3 self-baseline rounded-xl border border-slate-200  bg-gradient-to-br from-red-200 to-pink-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
// <table>
//   <thead>
//     <tr>
//       <th style={{ width: "200px" }}>ID</th>
//       <th style={{ width: "200px" }}>Nama</th>
//       <th style={{ width: "200px" }}>Desc</th>
//       {/* <th style={{ width: "200px" }}>Kelamin</th>
//       <th style={{ width: "200px" }}>Tanggal Lahir</th>
//       <th style={{ width: "200px" }}>Umur</th>
//       <th style={{ width: "200px" }}>Status</th>
//       <th style={{ width: "200px" }}>Action</th> */}
//     </tr>
//   </thead>
//   <tbody>
//     {data &&
//       data.map((val) => {
//         // const usia = dayjs().diff(dayjs(lansia.dob), "year");
//         // const bulan = dayjs().diff(dayjs(lansia.dob), "month") % 12;
//         // const hari = dayjs().diff(dayjs(lansia.dob), "day") % 30;

//         return (
//           <tr key={val.ID}>
//             {/* <td>{`${lansia.gender.toUpperCase()}${lansia.id}`}</td> */}
//             <td>{val.ID}</td>
//             <td>{val.NAME}</td>
//             <td>{val.DESCRIPTION}</td>
//             {/* <td>{lansia.gender === "l" ? "Laki - Laki" : "Perempuan"}</td> */}

//             {/* <td>{`${usia} Tahun ${bulan} Bulan ${hari} Hari`}</td> */}
//             {/* <td>
//               {usia > 65
//                 ? "Tua Renta"
//                 : usia > 49
//                 ? "Tua"
//                 : "Menjelang Tua"}
//             </td> */}
//             {/* <td>
//               <button onClick={() => onDelete(lansia)}>Delete</button>
//             </td> */}
//           </tr>
//         );
//       })}
//   </tbody>
// </table>

export default App;
