"use client";
import { useRouter } from "next/navigation";
import React from "react";
import Image from "next/image";

const RegisterForm = ({
  isMobile,
  formik,
  registrationSuccess,
  isModalOpen,
  userName,
  setUserName,
  addNickname,
}) => {
  const router = useRouter();

  return (
    <>
      <div
        className={`flex min-h-screen items-center justify-center background text-black ${
          isMobile ? "" : "desktop-height"
        }`}
      >
        <div className="w-full max-w-xl mx-auto flex roundedFirst overflow-hidden">
          {!isMobile ? (
            <div className="w-1/2 p-8 text-center flex flex-col items-center joinRellyBg justify-center">
              <Image
                src="/assets/relly_wink_pointing_right.png"
                alt="Image"
                width={200}
                height={150}
                className="rellyImg rounded-lg animated-logo"
              />
              <p className={`text-3xl font-bold mt-4 animated-welcome-button`}>
                Join Relly
              </p>
              <p className="text-lg mt-2 font-semibold animated-main-title">
                Your Trusted Relationship <br /> Guide!
              </p>
            </div>
          ) : null}
          <form
            onSubmit={formik.handleSubmit}
            className={`${isMobile ? "w-full" : "w-1/2"} ${
              isMobile ? "" : "formRellyBg"
            } p-8  roundedSecond flex flex-col items-center justify-center`}
          >
            {isMobile ? (
              <>
                <Image
                  src="/assets/relly2.png"
                  alt="Image"
                  width={200}
                  height={150}
                  className="rellyImg rounded-lg mx-auto animated-main-image"
                />
                <p className="text-3xl font-semibold mt-0 text-center animated-main-title">
                  Join Relly
                </p>
                <p className="text-lg mt-1 font-semibold text-center animated-main-text">
                  Your Trusted Relationship <br /> Guide!
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl hidden md:block font-semibold leading-9 tracking-tight mb-2 text-center animated-logo-text">
                  Get Started
                </h2>
              </>
            )}

            <div className="flex flex-col justify-between items-center gap-4 w-full mt-2">
              <div className="w-3/4">
                <h2 className="block leading-9 font-semibold tracking-tight text-xl md:hidden animated-signIn-text">
                  Sign Up
                </h2>
              </div>

              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First Name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.firstName}
                required
                className={`block ${
                  isMobile ? "w-3/4" : "w-full"
                }  border-gray-300 py-2 px-3 text-gray-800 shadow-sm rounded border focus:outline-none sm:text-sm`}
              />
              {formik.touched.firstName && formik.errors.firstName ? (
                <div>{formik.errors.firstName}</div>
              ) : null}

              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last Name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.lastName}
                required
                className={`block ${
                  isMobile ? "w-3/4" : "w-full"
                }  border-gray-300 py-2 px-3 text-gray-800 shadow-sm rounded border focus:outline-none sm:text-sm `}
              />
              {formik.touched.lastName && formik.errors.lastName ? (
                <div>{formik.errors.lastName}</div>
              ) : null}

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email address"
                autoComplete="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                required
                className={`block ${
                  isMobile ? "w-3/4" : "w-full"
                }  border-gray-300 py-2 px-3 text-gray-800 shadow-sm rounded border focus:outline-none sm:text-sm`}
              />
              {formik.touched.email && formik.errors.email ? (
                <div>{formik.errors.email}</div>
              ) : null}

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                required
                className={`block ${
                  isMobile ? "w-3/4" : "w-full"
                }  border-gray-300 py-2 px-3 text-gray-800 shadow-sm rounded border focus:outline-none sm:text-sm`}
              />
              {formik.touched.password && formik.errors.password ? (
                <div>{formik.errors.password}</div>
              ) : null}

              <input
                id="passwordAgain"
                name="passwordAgain"
                type="password"
                placeholder="Confirm Password"
                autoComplete="current-password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.passwordAgain}
                required
                className={`block ${
                  isMobile ? "w-3/4" : "w-full"
                }  border-gray-300 py-2 px-3 text-gray-800 shadow-sm rounded border focus:outline-none sm:text-sm`}
              />
              {formik.touched.passwordAgain && formik.errors.passwordAgain ? (
                <div>{formik.errors.passwordAgain}</div>
              ) : null}

              <button
                type="submit"
                disabled={!formik.dirty || !formik.isValid}
                className={`max-w-xs mx-auto py-2 px-4 font-medium ${
                  isMobile ? "customMobileButton" : "customButton"
                }`}
              >
                Sign Up
              </button>
            </div>
            <div className="animated-learn-more">
              <p className="mt-6 text-center text-md font-semibold text-black md:text-sm">
                Already started?{" "}
                <button
                  onClick={() => router.push("signIn")}
                  className="font-semibold leading-6 text-black underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
          {registrationSuccess && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-50 z-50 text-center">
              <div className="bg-white w-96 p-6 rounded-md shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <p className="text-xl font-semibold mb-4 text-gray-800">
                  Thank you for joining Relly.
                </p>
                <p className="text-md text-gray-600 mb-6 font-medium">
                  Verify your email before proceeding. Keep this page open and
                  return after verification to finish creating your account!
                </p>
                <button
                  onClick={() => router.push("signIn")}
                  className="second-welcome-button hover:bg-ff9090 transform hover:scale-105 transition duration-300"
                >
                  Go to Login
                </button>
              </div>
            </div>
          )}
          ;
          {isModalOpen && (
            <div className="fixed top-0 left-0 p w-full h-full flex items-center justify-center z-50">
              <div className="absolute top-0 left-0 w-full h-screen bg-black opacity-50"></div>
              <div
                className={`relative modalBg modalRounded nicknamePadding ${
                  isMobile ? "nicknameModal" : "modalPropsDesktop"
                }`}
              >
                <div className="text-center">
                  <Image
                    src="/assets/relly_hands_together.png"
                    alt="Success Image"
                    width={250}
                    height={200}
                    className="mx-auto mt-6 "
                  />

                  <p className="text-lg font-semibold">
                    What do you want me to call you?
                  </p>
                  <div className="flex items-center justify-center mt-2">
                    {" "}
                    <input
                      type="text"
                      placeholder="Nickname"
                      onChange={(e) => setUserName(e.target.value)}
                      className="rounded-full py-2 px-4 border border-gray-300 focus:outline-none focus:ring focus:border-blue-300 mr-2"
                    />
                    <button
                      onClick={() => addNickname()}
                      disabled={!userName.trim()}
                    >
                      <svg
                        width="40"
                        height="35"
                        viewBox="0 0 40 35"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <mask id="path-2-inside-1_1_8" fill="white">
                          <path d="M0 17.5C0 7.83502 7.83502 0 17.5 0H22.5C32.165 0 40 7.83502 40 17.5C40 27.165 32.165 35 22.5 35H17.5C7.83502 35 0 27.165 0 17.5Z" />
                        </mask>
                        <path
                          d="M0 17.5C0 7.83502 7.83502 0 17.5 0H22.5C32.165 0 40 7.83502 40 17.5C40 27.165 32.165 35 22.5 35H17.5C7.83502 35 0 27.165 0 17.5Z"
                          fill="#FFBFBF"
                        />
                        <path
                          d="M-1.5 17.5C-1.5 7.55887 6.55887 -0.5 16.5 -0.5H23.5C33.4411 -0.5 41.5 7.55887 41.5 17.5H38.5C38.5 8.11116 31.3366 0.5 22.5 0.5H17.5C8.66344 0.5 1.5 8.11116 1.5 17.5H-1.5ZM41.5 19C41.5 29.4934 32.9934 38 22.5 38H17.5C7.00659 38 -1.5 29.4934 -1.5 19L1.5 17.5C1.5 25.5081 8.66344 32 17.5 32H22.5C31.3366 32 38.5 25.5081 38.5 17.5L41.5 19ZM17.5 38C7.00659 38 -1.5 29.4934 -1.5 19V17.5C-1.5 7.55887 6.55887 -0.5 16.5 -0.5L17.5 0.5C8.66344 0.5 1.5 8.11116 1.5 17.5C1.5 25.5081 8.66344 32 17.5 32V38ZM23.5 -0.5C33.4411 -0.5 41.5 7.55887 41.5 17.5V19C41.5 29.4934 32.9934 38 22.5 38V32C31.3366 32 38.5 25.5081 38.5 17.5C38.5 8.11116 31.3366 0.5 22.5 0.5L23.5 -0.5Z"
                          fill="#FF9999"
                          mask="url(#path-2-inside-1_1_8)"
                        />
                        <path
                          d="M29.3333 12.1675C29.3333 12.5603 29.2263 12.8942 29.0122 13.1692L20.7082 23.8342L19.1484 25.8375C18.9343 26.1125 18.6743 26.25 18.3685 26.25C18.0626 26.25 17.8026 26.1125 17.5885 25.8375L16.0287 23.8342L11.8767 18.5017C11.6626 18.2267 11.5556 17.8928 11.5556 17.5C11.5556 17.1072 11.6626 16.7733 11.8767 16.4983L13.4366 14.4949C13.6507 14.22 13.9106 14.0825 14.2165 14.0825C14.5223 14.0825 14.7823 14.22 14.9964 14.4949L18.3685 18.8405L25.8925 9.16246C26.1066 8.88749 26.3665 8.75 26.6724 8.75C26.9783 8.75 27.2382 8.88749 27.4523 9.16246L29.0122 11.1658C29.2263 11.4408 29.3333 11.7747 29.3333 12.1675Z"
                          fill="#FAFAFA"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RegisterForm;
