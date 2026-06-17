using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Store.API.Data
{
    public class StoreDbContextFactory : IDesignTimeDbContextFactory<StoreDbContext>
    {
        public StoreDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<StoreDbContext>();
            var connectionString = "Host=localhost;Port=5432;Database=store_db;Username=postgres;Password=postgres123";
            optionsBuilder.UseNpgsql(connectionString);
            return new StoreDbContext(optionsBuilder.Options);
        }
    }
}