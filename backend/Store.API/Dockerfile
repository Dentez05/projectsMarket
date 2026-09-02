FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["Store.API.csproj", "."]
RUN dotnet restore "Store.API.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "Store.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Store.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Store.API.dll"]
