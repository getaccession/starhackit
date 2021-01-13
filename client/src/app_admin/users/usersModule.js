/* @jsxImportSource @emotion/react */
import { createElement as h } from "react";
import { observable, action } from "mobx";
import AsyncOp from "utils/asyncOp";
import user from "./userComponent";
import usersCreate from "./users";

export default function(context) {
  const { rest } = context;
  const asyncOpCreate = AsyncOp(context);

  function Stores() {
    const userStore = observable({
      language: "US",
      errors: {},
      email: "",
      age: "",
      opGet: asyncOpCreate((id, data) => rest.get(`users/${id}`, data)),
      get: action(async function (id) {
        const response = await this.opGet.fetch(id);
        merge(userStore, response);
      }),
      opUpdate: asyncOpCreate((id, payload) => rest.patch(`users/${id}`, payload)),
      update: action(async function (id) {
        this.errors = {};
        const payload = {
          age: this.age || ""
        };
        const response = await this.opUpdate.fetch(id);
        merge(userStore, response);
        // context.alertStack.add(
        //   <Alert.Info message={tr.t("User updated")} />
        // );
      })
    });
    return {
      user: userStore
    };
  }

  function merge(user, response) {
    user.id = response.id;
    user.username = response.username;
    user.age = response.age;
    user.firstname = response.firstName;
    user.email = response.email;
  }

  function selectOne(userId) {
    context.history.push(`users/${userId}`);
  }

  const users = usersCreate(context, {
    selectOne,
    getAll: data => rest.get(`users/`, data)
  });

  function Routes(stores) {
    return [
      {
        path: "",
        protected: true,
        children: [
          {
            path: "",
            action: routerContext => {
              users.store.selectPage(1);
              return {
                routerContext,
                title: "Users",
                component: users.component
              };
            }
          },
          {
            path: "/:userId",
            action: routerContext => {
              stores.user.get(routerContext.params.userId);
              return {
                routerContext,
                title: "User",
                component: h(user(context), { store: stores.user })
              };
            }
          }
        ]
      }
    ];
  }
  const stores = Stores();

  return {
    stores: () => stores,
    routes: () => Routes(stores)
  };
}
