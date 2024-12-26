import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  useDisclosure,
  ModalHeader,
  ModalBody,
} from "@nextui-org/modal";
import { Avatar } from "@nextui-org/avatar";
import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import { Checkbox } from "@nextui-org/checkbox";
import { Input } from "@nextui-org/input";
import {
  useAppSelector,
  useAppDispatch,
  awaitTimeout,
} from "@/libs/constants/AppFunctions";
import { saveLoginHandler } from "@/libs/redux/reducers/LoginReducer";
import { getKeyType, validateKeychain } from "@/libs/steem/condenser";
import { getAuthorExt } from "@/libs/steem/sds";
import { validate_account_name } from "@/libs/utils/ChainValidation";
import { getResizedAvatar } from "@/libs/utils/image";
import {
  getCredentials,
  saveSessionKey,
  validatePassword,
  saveCredentials,
  sessionKey,
  getAllCredentials,
  getUserAuth,
  getSessionToken,
} from "@/libs/utils/user";
import { toast } from "sonner";
import { signIn, useSession } from "next-auth/react";
import AccountItemCard from "./AccountItemCard";
import Link from "next/link";
import { SignupLink } from "@/libs/constants/AppConstants";
import secureLocalStorage from "react-secure-storage";
import { encryptPrivateKey } from "@/libs/utils/encryption";
import { supabase } from "@/libs/supabase";
import KeychainButton from "../KeychainButton";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
  onForget?: (username: string) => void;
  onLoginSuccess?: (auth: User) => void;
  isNew?: boolean;
}

export default function AuthModal2(props: Props) {
  let { open, onLoginSuccess, isNew, onForget } = props;

  const [isShow, setIsShow] = useState(true);
  const { isOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const dispatch = useAppDispatch();
  const [avatar, setAvatar] = useState("");

  let [formData, setFormData] = useState({
    username: "",
    key: "",
    password: "",
    password2: "",
  });

  const { data: session, status } = useSession();
  const [isCurrent, setIsCurrent] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  const [accounts, setAccounts] = useState<User[]>();
  let [credentials, setCredentials] = useState<User>();
  const router = useRouter();

  const isLocked =
    status === "authenticated" &&
    !sessionKey &&
    (credentials?.type === "ACTIVE" || !getSessionToken(session.user?.name));

  useEffect(() => {
    setCredentials(getCredentials());
  }, []);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      formData.username = formData.username.trim().toLowerCase();
      setAvatar(formData.username);
    }, 1000);

    return () => clearTimeout(timeOut);
  }, [formData.username]);

  useEffect(() => {
    const allCredentials = getAllCredentials();
    setAccounts(allCredentials);

    const timeOut = setTimeout(() => {
      setIsShow(false);
    }, 1000);

    return () => clearTimeout(timeOut);
  }, []);

  function handleOnClose() {
    onClose();
    if (props.onClose) props.onClose();
  }

  function clearAll() {
    setFormData({
      username: "",
      password: "",
      password2: "",
      key: "",
    });
  }

  async function handleUnlock() {
    if (!formData.password) {
      toast.info("Enter the password");
      return;
    }

    setLoading(true);
    await awaitTimeout(3);

    credentials = getCredentials(formData.password);
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      setLoading(false);
      return;
    }
    const enc = saveSessionKey(formData.password);
    if (
      remember &&
      (credentials.type === "POSTING" || credentials.type === "MEMO")
    ) {
      const auth = getUserAuth();
      if (auth)
        secureLocalStorage.setItem(
          `token_${credentials.username}`,
          encryptPrivateKey(
            formData.password,
            auth?.key.toString()?.substring(0, 20)
          )
        );
    }

    toast.success("Unlocked");
    onLoginSuccess && onLoginSuccess({ ...credentials, key: enc });
    handleOnClose();
    clearAll();
    setLoading(false);
  }

  function onComplete(error?: any | null) {
    setLoading(false);
    if (error) toast.error(error.message || JSON.stringify(error));
    else router.refresh();
  }

  async function getAuthenticate(
    account: AccountExt,
    username: string,
    key: string,
    password: string,
    type: Keys
  ) {
    const isKeychain = key === "keychain";
    if (!isNew) {
      supabase.auth
        .signInAnonymously()
        .then(async () => {
          const auth = saveCredentials(
            username,
            key,
            password,
            type,
            false,
            isKeychain
          );

          if (!auth) {
            onComplete(new Error("Something went wrong!"));
            return;
          }

          const response = await signIn("credentials", {
            username: username,
            redirect: false,
          });

          if (!response?.ok) {
            onComplete(response);
            return;
          }
          saveSessionKey(password);
          dispatch(
            saveLoginHandler({
              ...account,
              login: true,
              encKey: auth?.key,
            })
          );
          onLoginSuccess &&
            onLoginSuccess({
              username: username,
              key: auth?.key ?? "",
              type: type,
              memo: auth?.memo || "",
            });
          handleOnClose();
          clearAll();
          toast.success(`Login successsful with private ${type} key`);
          onComplete();
        })
        .catch((error) => {
          onComplete(error);
        });
    } else {
      const auth = saveCredentials(
        username,
        key,
        password,
        type,
        isCurrent,
        isKeychain
      );
      if (auth) {
        if (isCurrent) {
          const response = await signIn("credentials", {
            username: username,
            redirect: false,
          });

          if (!response?.ok) {
            onComplete(response);
            return;
          }
          saveSessionKey(password);
          dispatch(
            saveLoginHandler({
              ...account,
              login: true,
              encKey: auth?.key,
            })
          );
          onLoginSuccess &&
            onLoginSuccess({
              username: username,
              key: auth?.key ?? "",
              type: type,
              memo: auth?.memo || "",
            });
          toast.success(`Login successsful with private ${type} key`);
        } else toast.success(`${auth?.username} added successfully`);

        handleOnClose();
        clearAll();
        onComplete();
      } else {
        onComplete(new Error("Something went wrong!"));
      }
    }
  }
  async function handleLogin() {
    formData.username = formData.username.trim().toLowerCase();

    const usernameError = validate_account_name(formData.username);
    if (!formData.username || usernameError) {
      toast.info(usernameError ?? "Invalid username");
      return;
    }

    if (!formData.key) {
      toast.info("Invalid private key");
      return;
    }

    if (!formData.password) {
      toast.info("Enter the password");
      return;
    }

    if (!formData.password || formData.password !== formData.password2) {
      toast.info("Password does not matched");
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.info(
        "Weak password. Please use a combination of uppercase and lowercase letters, numbers, and special characters"
      );
      return;
    }

    setLoading(true);
    await awaitTimeout(1);
    try {
      const account = await getAuthorExt(formData.username);
      if (account) {
        const keyType = getKeyType(account, formData.key);

        if (keyType) {
          if (["MASTER", "OWNER"].includes(keyType.type)) {
            toast.info(
              "Higher-level keys are prohibited to protect your account."
            );
            setLoading(false);

            return;
          }

          await getAuthenticate(
            account,
            formData.username,
            formData.key,
            formData.password,
            keyType.type
          );
        } else {
          onComplete(new Error(`Invalid credentials`));
        }
      }
    } catch (e) {
      onComplete(e);
    }
  }

  async function handleKeychainLogin() {
    formData.username = formData.username.trim().toLowerCase();

    const usernameError = validate_account_name(formData.username);
    if (!formData.username || usernameError) {
      toast.info(usernameError ?? "Invalid username");
      return;
    }

    await validateKeychain();

    setLoading(true);
    await awaitTimeout(1);

    try {
      const account = await getAuthorExt(formData.username);
      if (account) {
        window.steem_keychain.requestSignBuffer(
          formData.username,
          "SteemPro Authentication",
          "Posting",
          function (response) {
            if (response?.success && response?.result) {
              getAuthenticate(
                account,
                formData.username,
                "keychain",
                "",
                "POSTING"
              );
            } else {
              onComplete(response);
            }
          }
        );
      } else {
        onComplete(new Error(`Invalid credentials`));
      }
    } catch (e) {
      onComplete(e);
    }
  }
  return (
    <>
      <Modal
        className=" mt-4"
        scrollBehavior="inside"
        placement="top-center"
        size="md"
        onSubmit={(e) => {
          e.preventDefault();
          if (isLocked && !isNew) {
            handleUnlock();
            return;
          }
          handleLogin();
        }}
        backdrop={"opaque"}
        isOpen={open}
        hideCloseButton
        isDismissable={!loading}
        onClose={handleOnClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              {isShow ? null : (
                <ModalHeader className="flex flex-col gap-1">
                  {isLocked && !isNew ? (
                    "Locked"
                  ) : (
                    <div className=" flex flex-row gap-2 justify-between">
                      <p>Log in</p>
                      <KeychainButton
                        size="md"
                        isDisabled={loading}
                        onPress={() => {
                          handleKeychainLogin();
                        }}
                      />
                    </div>
                  )}
                </ModalHeader>
              )}
              <ModalBody>
                <div className="flex flex-col w-full">
                  {isShow ? (
                    <Spinner className=" self-center m-auto" />
                  ) : isLocked && !isNew ? (
                    <form className="flex flex-col gap-4">
                      <div className="text-md font-bold flex items-center space-x-2">
                        <p>Hi, {loginInfo.name}</p>
                        <Avatar
                          className="shadow-lg cursor-pointer bg-foreground-900/40"
                          src={getResizedAvatar(loginInfo.name)}
                          size="sm"
                        />
                      </div>

                      <Input
                        size="sm"
                        autoFocus
                        value={formData.password}
                        isRequired
                        onValueChange={(value) =>
                          setFormData({ ...formData, password: value })
                        }
                        isDisabled={loading}
                        label="Encryption password"
                        placeholder="Enter password to unlock account"
                        type="password"
                      />

                      {(credentials?.type === "POSTING" ||
                        credentials?.type === "MEMO") && (
                        <Checkbox
                          isSelected={remember}
                          isDisabled={loading}
                          onValueChange={setRemember}
                        >
                          Remember
                        </Checkbox>
                      )}

                      <div className="text-start text-small text-default-600">
                        <Button
                          size="sm"
                          variant="light"
                          isDisabled={loading}
                          onPress={() => {
                            onForget && onForget(loginInfo.name);
                          }}
                        >
                          Forget password?
                        </Button>
                      </div>

                      <div className="flex gap-2 items-center">
                        <Button
                          color="danger"
                          variant="light"
                          onPress={onClose}
                          isDisabled={loading}
                        >
                          Cancel
                        </Button>

                        <Button
                          fullWidth
                          color="primary"
                          isLoading={loading}
                          onPress={handleUnlock}
                          isDisabled={loading}
                        >
                          Unlock
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <form className="flex flex-col gap-4">
                      <Input
                        isRequired
                        size="sm"
                        label="Username"
                        autoFocus
                        value={formData.username}
                        endContent={
                          <Avatar src={getResizedAvatar(avatar)} size="sm" />
                        }
                        onValueChange={(value) =>
                          setFormData({ ...formData, username: value })
                        }
                        isDisabled={loading}
                        placeholder="Enter your username"
                        type="text"
                      />
                      <Input
                        size="sm"
                        value={formData.key}
                        onValueChange={(value) =>
                          setFormData({ ...formData, key: value })
                        }
                        isDisabled={loading}
                        // isRequired
                        label="Private key"
                        placeholder="Enter your private posting key"
                        type="password"
                      />

                      <div className="flex flex-row gap-2 items-center">
                        <Input
                          size="sm"
                          value={formData.password}
                          isRequired
                          isDisabled={loading}
                          onValueChange={(value) =>
                            setFormData({ ...formData, password: value })
                          }
                          label="Encryption password"
                          placeholder="Enter enc. password"
                          type="password"
                        />

                        <Input
                          size="sm"
                          value={formData.password2}
                          onValueChange={(value) =>
                            setFormData({ ...formData, password2: value })
                          }
                          isRequired
                          isDisabled={loading}
                          label="Confirm password"
                          placeholder="Re-enter password"
                          type="password"
                        />
                      </div>

                      {isNew && (
                        <Checkbox
                          isSelected={isCurrent}
                          isDisabled={loading}
                          onValueChange={setIsCurrent}
                        >
                          set as default
                        </Checkbox>
                      )}

                      <div className="text-start text-small text-default-600">
                        Need to create an account?{" "}
                        <Link
                          className="hover:text-blue-500 font-semibold"
                          href={SignupLink}
                          target="_blank"
                        >
                          Sign up
                        </Link>
                      </div>
                      <div className="flex flex-row gap-2 overflow-x-auto p-1">
                        {!!!loginInfo.name &&
                          accounts?.map((user) => {
                            return (
                              <div
                                className="w-fit"
                                key={`${user?.username}-${user.type}`}
                              >
                                <AccountItemCard
                                  switchText="Login"
                                  isDisabled={loading}
                                  user={user}
                                  isLogin
                                  className="px-[2px] py-1 rounded-lg shadow-none"
                                  handleSwitchSuccess={() => {
                                    {
                                      handleOnClose();
                                      clearAll();
                                    }
                                  }}
                                />
                              </div>
                            );
                          })}
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          color="danger"
                          variant="light"
                          onPress={onClose}
                          isDisabled={loading}
                        >
                          Cancel
                        </Button>

                        <Button
                          fullWidth
                          color="primary"
                          isLoading={loading}
                          onPress={handleLogin}
                          isDisabled={loading}
                        >
                          {isNew ? "Add account" : "Login"}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* <Tab key="sign-up" title="Sign up">
                                                <form className="flex flex-col gap-4 h-[300px]">
                                                    <Input isRequired label="Name" placeholder="Enter your name" type="password" />
                                                    <Input isRequired label="Email" placeholder="Enter your email" type="email" />
                                                    <Input
                                                        isRequired
                                                        label="Password"
                                                        placeholder="Enter your password"
                                                        type="password"
                                                    />
                                                    <p className="text-center text-small">
                                                        Already have an account?{" "}
                                                        <Link size="sm"
                                                            onClick={() => setSelected('login')}>
                                                            Login
                                                        </Link>
                                                    </p>
                                                    <div className="flex gap-2 justify-end">
                                                        <Button fullWidth color="primary" >
                                                            Sign up
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Tab> */}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
