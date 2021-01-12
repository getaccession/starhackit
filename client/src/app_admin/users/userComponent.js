import React, { createElement as h } from "react";
import { observer } from "mobx-react";
import page from "components/Page";
import paper from "components/Paper";
import input from "mdlean/lib/input";
import button from "mdlean/lib/button";
import spinner from "components/spinner";
import formGroup from "components/FormGroup";

export default (context) => {
  const { tr } = context;
  const FormGroup = formGroup(context);
  const Page = page(context);
  const Paper = paper(context);
  const UserIdInput = input(context);
  const UsernameInput = input(context);
  const EmailInput = input(context);
  const AgeInput = input(context);
  const Button = button(context);

  function UserComponent({ store }) {
    const { errors } = store;
    if (store.opGet.loading) {
      return h(spinner(context));
    }
    // const user = store.opGet.data;
    // if (!user) {
    //   return null;
    // }
    return (
      <Page className="user-view">
        <Paper>
        <form onSubmit={(e) => e.preventDefault()}>
          <h3>{tr.t("User")}</h3>
          <FormGroup>
            <UserIdInput id="id" value={store.id} disabled label={tr.t("Id")} />
          </FormGroup>
          <FormGroup>
            <UsernameInput
              id="username"
              value={store.username}
              disabled
              label={tr.t("Username")}
            />
          </FormGroup>
          <FormGroup>
            <EmailInput
              id="email"
              value={store.email}
              disabled
              label={tr.t("Email")}
            />
          </FormGroup>
          <FormGroup>
            <AgeInput
              id="age"
              value={store.age}
              // disabled
              error={errors.age && errors.age[0]}
              rows={1}
              onChange={(e) => {
                store.age = e.target.value;
              }}
              label={tr.t("Age")}
            />
          </FormGroup>
          <FormGroup>
            <Button
              raised
              onClick={() => store.update(store.id)}
              label={tr.t("Update User")}
            />
          </FormGroup>
          </form>
        </Paper>
      </Page>
    );
  }
  return observer(UserComponent);
};
