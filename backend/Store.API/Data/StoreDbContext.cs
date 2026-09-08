using Microsoft.EntityFrameworkCore;
using Store.API.Models.Entities;


namespace Store.API.Data
{
    public class StoreDbContext : DbContext
    {
        public StoreDbContext(DbContextOptions<StoreDbContext> options) : base(options) 
        {
        }

        public DbSet<Project> Projects { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<ProjectFile> ProjectFiles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Project>(entity =>
            {
                entity.ToTable("projects");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.Images).HasColumnType("jsonb");
                entity.Property(e => e.Technologies).HasColumnType("jsonb");
                entity.HasIndex(e => e.CreatedByUserId);
                entity.HasIndex(e => e.Status);

                entity.HasOne(e => e.Category)
                    .WithMany(c => c.Projects)
                    .HasForeignKey(e => e.CategoryId)
                    .OnDelete(DeleteBehavior.SetNull);
            });


            modelBuilder.Entity<Category>(entity =>
            {
                entity.ToTable("categories");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.ToTable("orders");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.OrderNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.TotalAmount).HasColumnType("decimal(10,2)");
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.OrderNumber).IsUnique();
                entity.HasIndex(e => e.Status);
            });

            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.ToTable("order_items");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PriceAtTime).HasColumnType("decimal(10,2)");

                entity.HasOne(e => e.Order)
                    .WithMany(o => o.OrderItems)
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Project)
                    .WithMany(p => p.OrderItems)
                    .HasForeignKey(e => e.ProjectId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<CartItem>(entity =>
            {
                entity.ToTable("cart_items");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.ProjectId }).IsUnique();

                entity.HasOne(e => e.Project)
                    .WithMany(p => p.CartItems)
                    .HasForeignKey(e => e.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ProjectFile>(entity =>
            {
                entity.ToTable("project_files");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ProjectId);
                entity.HasIndex(e => e.FileType);

                entity.HasOne(e => e.Project)
                    .WithMany(p => p.ProjectFiles)
                    .HasForeignKey(e => e.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }

    }
}
