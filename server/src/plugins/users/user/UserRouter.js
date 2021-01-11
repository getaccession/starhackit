const _ = require("lodash");
const Qs = require("qs");
const Op = require("sequelize").Op;

function UserRouter(app) {
  const { models } = app.data.sequelize;

  const api = {
    pathname: "/users",
    middlewares: [
      app.server.auth.isAuthenticated,
      app.server.auth.isAuthorized
    ],
    ops: {
      getAll: {
        pathname: "/",
        method: "get",
        handler: async context => {
          const filter = Qs.parse(context.request.querystring);
          _.defaults(filter, {
            limit: 100,
            order: "DESC",
            offset: 0
          });
          const result = await models.User.findAndCountAll({
            limit: filter.limit,
            order: [["createdAt", filter.order]],
            offset: filter.offset,
            where: filter.search && {
              [Op.or]: [
                { username: { [Op.like]: `%${filter.search}%` } },
                { email: { [Op.like]: `%${filter.search}%` } }
              ]
            }
          });
          context.body = {
            count: result.count,
            data: result.rows.map(user => user.toJSON())
          };
          context.status = 200;
        }
      },
      getOne: {
        pathname: "/:id",
        method: "get",
        handler: async context => {
          const user = await models.User.findByUserId(context.params.id);

          if (!user) {
            context.status = 404;
            context.body = {
              error: {
                code: 404,
                name: "NotFound"
              }
            };
          } else {
            context.body = user.get();
            context.status = 200;
          }
        }
      },
      patch: {
        pathname: "/:id",
        method: "patch",
        handler: async context => {
          const userId = context.params.id;
          const data = context.request.body;
          await models.User.update(data, {
            where: {
              id: userId
            }
          });

          const updatedUser = await models.User.findByUserId(userId);
          context.body = updatedUser.get();
          context.status = 200;
        }
      }
    }
  };

  app.server.createRouter(api);
  return {};
}

module.exports = UserRouter;